#include "aeb_demo/transport/udp_packet.hpp"

#include <cassert>
#include <cstdint>
#include <vector>

namespace {

void DeserializesValidPacket() {
  aeb_demo::AebUdpPacketHeader header;
  header.frame_id = 11U;
  header.timestamp_ns = 22U;
  header.frame_size = 3U;
  header.packet_index = 0U;
  header.packet_count = 1U;
  header.payload_size = 3U;

  std::vector<std::uint8_t> bytes(sizeof(header) + 3U);
  aeb_demo::WritePacketHeader(header, bytes.data(), bytes.size());
  bytes[sizeof(header) + 0U] = 7U;
  bytes[sizeof(header) + 1U] = 8U;
  bytes[sizeof(header) + 2U] = 9U;

  aeb_demo::AebUdpPacket packet;
  assert(aeb_demo::DeserializeUdpPacket(bytes.data(), bytes.size(), &packet));
  assert(packet.header.frame_id == 11U);
  assert((packet.payload == std::vector<std::uint8_t>{7U, 8U, 9U}));
}

void RejectsShortPacket() {
  const std::vector<std::uint8_t> bytes(3U, 0U);
  aeb_demo::AebUdpPacket packet;

  assert(!aeb_demo::DeserializeUdpPacket(bytes.data(), bytes.size(), &packet));
}

void RejectsPayloadSizeMismatch() {
  aeb_demo::AebUdpPacketHeader header;
  header.frame_size = 3U;
  header.packet_count = 1U;
  header.payload_size = 4U;

  std::vector<std::uint8_t> bytes(sizeof(header) + 3U);
  aeb_demo::WritePacketHeader(header, bytes.data(), bytes.size());

  aeb_demo::AebUdpPacket packet;
  assert(!aeb_demo::DeserializeUdpPacket(bytes.data(), bytes.size(), &packet));
}

}  // namespace

int main() {
  DeserializesValidPacket();
  RejectsShortPacket();
  RejectsPayloadSizeMismatch();
  return 0;
}
