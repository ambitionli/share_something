#pragma once

#include "aeb_demo/common/frame_types.hpp"

#include <cstdint>

namespace aeb_demo {

struct DecoderConfig {
  std::uint32_t width = 1920U;
  std::uint32_t height = 1536U;
  PixelFormat output_format = PixelFormat::kNv12;
  bool low_latency = true;
};

class H264Decoder {
 public:
  virtual ~H264Decoder() = default;

  virtual bool Initialize(const DecoderConfig& config) = 0;
  virtual bool Decode(const H264Frame& input, YuvFrame* output) = 0;
  virtual void Shutdown() = 0;
};

}  // namespace aeb_demo
