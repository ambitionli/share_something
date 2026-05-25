#pragma once

#include "aeb_demo/decoder/h264_decoder.hpp"

typedef struct _GstElement GstElement;
typedef struct _GstSample GstSample;

namespace aeb_demo {

class GstreamerH264Decoder final : public H264Decoder {
 public:
  GstreamerH264Decoder() = default;
  GstreamerH264Decoder(const GstreamerH264Decoder&) = delete;
  GstreamerH264Decoder& operator=(const GstreamerH264Decoder&) = delete;
  ~GstreamerH264Decoder() override;

  bool Initialize(const DecoderConfig& config) override;
  bool Decode(const H264Frame& input, YuvFrame* output) override;
  void Shutdown() override;

 private:
  bool PullSample(const H264Frame& input, YuvFrame* output);

  DecoderConfig config_;
  GstElement* pipeline_ = nullptr;
  GstElement* appsrc_ = nullptr;
  GstElement* appsink_ = nullptr;
};

}  // namespace aeb_demo
