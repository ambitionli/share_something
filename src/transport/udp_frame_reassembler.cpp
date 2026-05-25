#include "aeb_demo/transport/udp_frame_reassembler.hpp"

#include <numeric>

namespace aeb_demo {

bool UdpFrameReassembler::PushPacket(
    const AebUdpPacket& packet,
    H264Frame* completed_frame) {
  if (completed_frame == nullptr) {
    return false;
  }

  if (!IsValidPacket(packet)) {
    return false;
  }

  if (!has_frame_ || packet.header.frame_id != frame_id_) {
    StartFrame(packet);
  }

  payloads_[packet.header.packet_index] = packet.payload;
  received_[packet.header.packet_index] = true;

  if (!IsComplete()) {
    return false;
  }

  *completed_frame = BuildFrame();
  Reset();
  return true;
}

void UdpFrameReassembler::Reset() {
  has_frame_ = false;
  frame_id_ = 0U;
  timestamp_ns_ = 0U;
  frame_size_ = 0U;
  packet_count_ = 0U;
  payloads_.clear();
  received_.clear();
}

bool UdpFrameReassembler::IsValidPacket(const AebUdpPacket& packet) const {
  if (packet.header.magic != kAebUdpMagic || packet.header.version != kAebUdpVersion) {
    return false;
  }

  if (packet.header.header_size != sizeof(AebUdpPacketHeader)) {
    return false;
  }

  if (packet.header.packet_count == 0U ||
      packet.header.packet_index >= packet.header.packet_count) {
    return false;
  }

  if (packet.header.payload_size != packet.payload.size()) {
    return false;
  }

  if (packet.header.payload_size > kAebUdpMaxPayloadBytes) {
    return false;
  }

  if (packet.header.frame_size == 0U) {
    return false;
  }

  return true;
}

void UdpFrameReassembler::StartFrame(const AebUdpPacket& packet) {
  has_frame_ = true;
  frame_id_ = packet.header.frame_id;
  timestamp_ns_ = packet.header.timestamp_ns;
  frame_size_ = packet.header.frame_size;
  packet_count_ = packet.header.packet_count;
  payloads_.assign(packet_count_, {});
  received_.assign(packet_count_, false);
}

bool UdpFrameReassembler::IsComplete() const {
  if (!has_frame_) {
    return false;
  }

  for (const bool received : received_) {
    if (!received) {
      return false;
    }
  }

  const std::size_t total_size = std::accumulate(
      payloads_.begin(),
      payloads_.end(),
      static_cast<std::size_t>(0U),
      [](const std::size_t sum, const std::vector<std::uint8_t>& payload) {
        return sum + payload.size();
      });

  return total_size == frame_size_;
}

H264Frame UdpFrameReassembler::BuildFrame() const {
  H264Frame frame;
  frame.frame_id = frame_id_;
  frame.timestamp_ns = timestamp_ns_;
  frame.is_key_frame = true;
  frame.data.reserve(frame_size_);

  for (const std::vector<std::uint8_t>& payload : payloads_) {
    frame.data.insert(frame.data.end(), payload.begin(), payload.end());
  }

  return frame;
}

}  // namespace aeb_demo
