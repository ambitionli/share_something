#include "aeb_demo/transport/annex_b_parser.hpp"
#include "aeb_demo/transport/udp_packet.hpp"

#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <chrono>
#include <cstdint>
#include <cstring>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>

namespace {

struct SenderConfig {
  std::string h264_path;
  std::string target_ip = "127.0.0.1";
  std::uint16_t target_port = 5600U;
  std::uint32_t fps = 30U;
  bool loop = false;
};

void PrintUsage(const char* program) {
  std::cerr << "Usage: " << program
            << " --file input.h264 [--ip 127.0.0.1] [--port 5600] [--fps 30] [--loop]\n";
}

std::uint16_t ParsePort(const std::string& value) {
  const int port = std::stoi(value);
  if (port <= 0 || port > 65535) {
    throw std::invalid_argument("port must be in range 1..65535");
  }
  return static_cast<std::uint16_t>(port);
}

std::uint32_t ParseFps(const std::string& value) {
  const int fps = std::stoi(value);
  if (fps <= 0 || fps > 240) {
    throw std::invalid_argument("fps must be in range 1..240");
  }
  return static_cast<std::uint32_t>(fps);
}

SenderConfig ParseArgs(const int argc, char** argv) {
  SenderConfig config;
  for (int index = 1; index < argc; ++index) {
    const std::string arg = argv[index];
    if (arg == "--file" && index + 1 < argc) {
      config.h264_path = argv[++index];
    } else if (arg == "--ip" && index + 1 < argc) {
      config.target_ip = argv[++index];
    } else if (arg == "--port" && index + 1 < argc) {
      config.target_port = ParsePort(argv[++index]);
    } else if (arg == "--fps" && index + 1 < argc) {
      config.fps = ParseFps(argv[++index]);
    } else if (arg == "--loop") {
      config.loop = true;
    } else {
      throw std::invalid_argument("unknown or incomplete argument: " + arg);
    }
  }

  if (config.h264_path.empty()) {
    throw std::invalid_argument("--file is required");
  }
  return config;
}

std::vector<std::uint8_t> ReadFile(const std::string& path) {
  std::ifstream input(path, std::ios::binary);
  if (!input) {
    throw std::runtime_error("failed to open H.264 file: " + path);
  }

  input.seekg(0, std::ios::end);
  const std::streamoff size = input.tellg();
  if (size <= 0) {
    throw std::runtime_error("H.264 file is empty: " + path);
  }

  std::vector<std::uint8_t> data(static_cast<std::size_t>(size));
  input.seekg(0, std::ios::beg);
  input.read(reinterpret_cast<char*>(data.data()), size);
  if (!input) {
    throw std::runtime_error("failed to read full H.264 file: " + path);
  }

  return data;
}

std::uint64_t NowNs() {
  const auto now = std::chrono::steady_clock::now().time_since_epoch();
  return static_cast<std::uint64_t>(
      std::chrono::duration_cast<std::chrono::nanoseconds>(now).count());
}

void SendFrame(
    const int socket_fd,
    const sockaddr_in& target,
    const aeb_demo::H264Frame& frame) {
  const std::uint16_t packet_count = static_cast<std::uint16_t>(
      (frame.data.size() + aeb_demo::kAebUdpMaxPayloadBytes - 1U) /
      aeb_demo::kAebUdpMaxPayloadBytes);

  if (packet_count == 0U) {
    return;
  }

  for (std::uint16_t packet_index = 0U; packet_index < packet_count; ++packet_index) {
    const std::size_t offset =
        static_cast<std::size_t>(packet_index) * aeb_demo::kAebUdpMaxPayloadBytes;
    const std::size_t remaining = frame.data.size() - offset;
    const std::size_t payload_size =
        std::min(remaining, aeb_demo::kAebUdpMaxPayloadBytes);

    aeb_demo::AebUdpPacketHeader header;
    header.frame_id = frame.frame_id;
    header.timestamp_ns = frame.timestamp_ns;
    header.frame_size = static_cast<std::uint32_t>(frame.data.size());
    header.packet_index = packet_index;
    header.packet_count = packet_count;
    header.payload_size = static_cast<std::uint16_t>(payload_size);
    header.flags = 0x1U;

    std::vector<std::uint8_t> packet(sizeof(header) + payload_size);
    std::memcpy(packet.data(), &header, sizeof(header));
    std::memcpy(packet.data() + sizeof(header), frame.data.data() + offset, payload_size);

    const ssize_t sent = sendto(
        socket_fd,
        packet.data(),
        packet.size(),
        0,
        reinterpret_cast<const sockaddr*>(&target),
        sizeof(target));
    if (sent != static_cast<ssize_t>(packet.size())) {
      throw std::runtime_error("failed to send UDP packet");
    }
  }
}

}  // namespace

int main(const int argc, char** argv) {
  try {
    const SenderConfig config = ParseArgs(argc, argv);
    const std::vector<std::uint8_t> stream = ReadFile(config.h264_path);
    std::vector<aeb_demo::H264Frame> frames =
        aeb_demo::AnnexBParser::ExtractAllIFrames(stream, NowNs());
    if (frames.empty()) {
      throw std::runtime_error("no IDR all-I frames found in H.264 file");
    }

    const int socket_fd = socket(AF_INET, SOCK_DGRAM, 0);
    if (socket_fd < 0) {
      throw std::runtime_error("failed to create UDP socket");
    }

    sockaddr_in target{};
    target.sin_family = AF_INET;
    target.sin_port = htons(config.target_port);
    if (inet_pton(AF_INET, config.target_ip.c_str(), &target.sin_addr) != 1) {
      close(socket_fd);
      throw std::runtime_error("invalid target IPv4 address: " + config.target_ip);
    }

    const auto frame_interval = std::chrono::nanoseconds(1000000000LL / config.fps);
    do {
      for (const aeb_demo::H264Frame& frame : frames) {
        SendFrame(socket_fd, target, frame);
        std::this_thread::sleep_for(frame_interval);
      }
    } while (config.loop);

    close(socket_fd);
    return 0;
  } catch (const std::exception& error) {
    std::cerr << "aeb_udp_h264_sender error: " << error.what() << '\n';
    PrintUsage(argv[0]);
    return 1;
  }
}
