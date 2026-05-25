#pragma once

#include <cstdint>

namespace aeb_demo {

constexpr std::uint32_t kAebUdpMagic = 0x41454231U;  // "AEB1"
constexpr std::uint16_t kAebUdpVersion = 1U;
constexpr std::size_t kAebUdpMaxPayloadBytes = 1200U;

#pragma pack(push, 1)
struct AebUdpPacketHeader {
  std::uint32_t magic = kAebUdpMagic;
  std::uint16_t version = kAebUdpVersion;
  std::uint16_t header_size = sizeof(AebUdpPacketHeader);
  std::uint64_t frame_id = 0U;
  std::uint64_t timestamp_ns = 0U;
  std::uint32_t frame_size = 0U;
  std::uint16_t packet_index = 0U;
  std::uint16_t packet_count = 0U;
  std::uint16_t payload_size = 0U;
  std::uint16_t flags = 0U;
};
#pragma pack(pop)

static_assert(sizeof(AebUdpPacketHeader) == 36U, "Unexpected UDP packet header size");

}  // namespace aeb_demo
