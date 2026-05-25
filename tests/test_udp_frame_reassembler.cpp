#include "aeb_demo/transport/udp_frame_reassembler.hpp"

#include <cassert>
#include <cstdint>
#include <vector>

namespace {

aeb_demo::AebUdpPacket MakePacket(
    const std::uint64_t frame_id,
    const std::uint16_t packet_index,
    const std::uint16_t packet_count,
    const std::vector<std::uint8_t>& payload) {
  aeb_demo::AebUdpPacket packet;
  packet.header.frame_id = frame_id;
  packet.header.timestamp_ns = 1234U + frame_id;
  packet.header.frame_size = 6U;
  packet.header.packet_index = packet_index;
  packet.header.packet_count = packet_count;
  packet.header.payload_size = static_cast<std::uint16_t>(payload.size());
  packet.payload = payload;
  return packet;
}

void ReassemblesOutOfOrderPackets() {
  aeb_demo::UdpFrameReassembler reassembler;
  aeb_demo::H264Frame frame;

  assert(!reassembler.PushPacket(MakePacket(7U, 1U, 2U, {4U, 5U, 6U}), &frame));
  assert(reassembler.PushPacket(MakePacket(7U, 0U, 2U, {1U, 2U, 3U}), &frame));

  assert(frame.frame_id == 7U);
  assert(frame.timestamp_ns == 1241U);
  assert(frame.is_key_frame);
  assert((frame.data == std::vector<std::uint8_t>{1U, 2U, 3U, 4U, 5U, 6U}));
}

void RejectsMalformedPacket() {
  aeb_demo::UdpFrameReassembler reassembler;
  aeb_demo::AebUdpPacket packet = MakePacket(1U, 0U, 1U, {1U});
  packet.header.magic = 0U;

  aeb_demo::H264Frame frame;
  assert(!reassembler.PushPacket(packet, &frame));
}

void NewFrameDropsIncompleteOldFrame() {
  aeb_demo::UdpFrameReassembler reassembler;
  aeb_demo::H264Frame frame;

  assert(!reassembler.PushPacket(MakePacket(1U, 0U, 2U, {1U, 2U, 3U}), &frame));
  assert(reassembler.PushPacket(MakePacket(2U, 0U, 1U, {9U, 8U, 7U, 6U, 5U, 4U}), &frame));

  assert(frame.frame_id == 2U);
  assert((frame.data == std::vector<std::uint8_t>{9U, 8U, 7U, 6U, 5U, 4U}));
}

}  // namespace

int main() {
  ReassemblesOutOfOrderPackets();
  RejectsMalformedPacket();
  NewFrameDropsIncompleteOldFrame();
  return 0;
}
