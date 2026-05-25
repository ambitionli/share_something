#pragma once

#include "aeb_demo/common/frame_types.hpp"

#include <mutex>

namespace aeb_demo {

class LatestFrameBuffer {
 public:
  LatestFrameBuffer() = default;
  LatestFrameBuffer(const LatestFrameBuffer&) = delete;
  LatestFrameBuffer& operator=(const LatestFrameBuffer&) = delete;

  void Write(const YuvFrame& frame);
  bool ReadLatest(YuvFrame* frame) const;

 private:
  mutable std::mutex mutex_;
  bool has_frame_ = false;
  YuvFrame latest_frame_;
};

}  // namespace aeb_demo
