#pragma once

#include "aeb_demo/common/frame_types.hpp"
#include "aeb_demo/transport/udp_frame_reassembler.hpp"

#include <cstdint>
#include <string>
#include <vector>

namespace aeb_demo {

struct UdpReceiverConfig {
  std::string listen_ip = "0.0.0.0";
  std::uint16_t port = 5600U;
  std::uint32_t receive_buffer_bytes = 4U * 1024U * 1024U;
  std::uint32_t receive_timeout_ms = 50U;
};

class UdpH264Receiver {
 public:
  explicit UdpH264Receiver(const UdpReceiverConfig& config);
  UdpH264Receiver(const UdpH264Receiver&) = delete;
  UdpH264Receiver& operator=(const UdpH264Receiver&) = delete;
  ~UdpH264Receiver();

  bool Start();
  void Stop();
  bool ReadFrame(H264Frame* frame);

 private:
  bool ConfigureSocket();

  UdpReceiverConfig config_;
  int socket_fd_ = -1;
  std::vector<std::uint8_t> packet_buffer_;
  UdpFrameReassembler reassembler_;
};

}  // namespace aeb_demo
