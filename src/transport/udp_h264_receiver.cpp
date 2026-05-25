#include "aeb_demo/transport/udp_h264_receiver.hpp"

#include "aeb_demo/transport/udp_packet.hpp"

#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <algorithm>
#include <cstring>

namespace aeb_demo {

UdpH264Receiver::UdpH264Receiver(const UdpReceiverConfig& config)
    : config_(config), packet_buffer_(sizeof(AebUdpPacketHeader) + kAebUdpMaxPayloadBytes) {}

UdpH264Receiver::~UdpH264Receiver() {
  Stop();
}

bool UdpH264Receiver::Start() {
  Stop();

  socket_fd_ = socket(AF_INET, SOCK_DGRAM, 0);
  if (socket_fd_ < 0) {
    return false;
  }

  if (!ConfigureSocket()) {
    Stop();
    return false;
  }

  sockaddr_in address{};
  address.sin_family = AF_INET;
  address.sin_port = htons(config_.port);
  if (inet_pton(AF_INET, config_.listen_ip.c_str(), &address.sin_addr) != 1) {
    Stop();
    return false;
  }

  if (bind(socket_fd_, reinterpret_cast<const sockaddr*>(&address), sizeof(address)) != 0) {
    Stop();
    return false;
  }

  return true;
}

void UdpH264Receiver::Stop() {
  if (socket_fd_ >= 0) {
    close(socket_fd_);
    socket_fd_ = -1;
  }
  reassembler_.Reset();
}

bool UdpH264Receiver::ReadFrame(H264Frame* frame) {
  if (socket_fd_ < 0 || frame == nullptr) {
    return false;
  }

  while (true) {
    const ssize_t received = recv(
        socket_fd_,
        packet_buffer_.data(),
        packet_buffer_.size(),
        0);
    if (received <= 0) {
      return false;
    }

    AebUdpPacket packet;
    if (!DeserializeUdpPacket(
            packet_buffer_.data(),
            static_cast<std::size_t>(received),
            &packet)) {
      continue;
    }

    if (reassembler_.PushPacket(packet, frame)) {
      return true;
    }
  }
}

bool UdpH264Receiver::ConfigureSocket() {
  const int reuse = 1;
  if (setsockopt(socket_fd_, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse)) != 0) {
    return false;
  }

  const int receive_buffer = static_cast<int>(
      std::min<std::uint32_t>(config_.receive_buffer_bytes, 64U * 1024U * 1024U));
  if (setsockopt(
          socket_fd_,
          SOL_SOCKET,
          SO_RCVBUF,
          &receive_buffer,
          sizeof(receive_buffer)) != 0) {
    return false;
  }

  timeval timeout{};
  timeout.tv_sec = static_cast<time_t>(config_.receive_timeout_ms / 1000U);
  timeout.tv_usec = static_cast<suseconds_t>((config_.receive_timeout_ms % 1000U) * 1000U);
  if (setsockopt(socket_fd_, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout)) != 0) {
    return false;
  }

  return true;
}

}  // namespace aeb_demo
