#include "aeb_demo/transport/udp_packet.hpp"

#include <cstring>

namespace aeb_demo {

bool WritePacketHeader(
    const AebUdpPacketHeader& header,
    std::uint8_t* output,
    const std::size_t output_size) {
  if (output == nullptr || output_size < sizeof(AebUdpPacketHeader)) {
    return false;
  }

  std::memcpy(output, &header, sizeof(AebUdpPacketHeader));
  return true;
}

bool DeserializeUdpPacket(
    const std::uint8_t* data,
    const std::size_t data_size,
    AebUdpPacket* packet) {
  if (data == nullptr || packet == nullptr) {
    return false;
  }

  if (data_size < sizeof(AebUdpPacketHeader)) {
    return false;
  }

  AebUdpPacketHeader header;
  std::memcpy(&header, data, sizeof(AebUdpPacketHeader));

  if (header.magic != kAebUdpMagic || header.version != kAebUdpVersion) {
    return false;
  }

  if (header.header_size != sizeof(AebUdpPacketHeader)) {
    return false;
  }

  if (header.payload_size > kAebUdpMaxPayloadBytes) {
    return false;
  }

  if (data_size != sizeof(AebUdpPacketHeader) + header.payload_size) {
    return false;
  }

  packet->header = header;
  packet->payload.assign(data + sizeof(AebUdpPacketHeader), data + data_size);
  return true;
}

}  // namespace aeb_demo
