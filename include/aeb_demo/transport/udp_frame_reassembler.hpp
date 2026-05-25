#pragma once

#include "aeb_demo/common/frame_types.hpp"
#include "aeb_demo/transport/udp_packet.hpp"

#include <cstdint>
#include <vector>

namespace aeb_demo {

class UdpFrameReassembler {
 public:
  UdpFrameReassembler() = default;

  bool PushPacket(const AebUdpPacket& packet, H264Frame* completed_frame);
  void Reset();

 private:
  bool IsValidPacket(const AebUdpPacket& packet) const;
  void StartFrame(const AebUdpPacket& packet);
  bool IsComplete() const;
  H264Frame BuildFrame() const;

  bool has_frame_ = false;
  std::uint64_t frame_id_ = 0U;
  std::uint64_t timestamp_ns_ = 0U;
  std::uint32_t frame_size_ = 0U;
  std::uint16_t packet_count_ = 0U;
  std::vector<std::vector<std::uint8_t>> payloads_;
  std::vector<bool> received_;
};

}  // namespace aeb_demo
