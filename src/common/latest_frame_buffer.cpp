#include "aeb_demo/common/latest_frame_buffer.hpp"

namespace aeb_demo {

void LatestFrameBuffer::Write(const YuvFrame& frame) {
  std::lock_guard<std::mutex> lock(mutex_);
  latest_frame_ = frame;
  has_frame_ = true;
}

bool LatestFrameBuffer::ReadLatest(YuvFrame* frame) const {
  if (frame == nullptr) {
    return false;
  }

  std::lock_guard<std::mutex> lock(mutex_);
  if (!has_frame_) {
    return false;
  }

  *frame = latest_frame_;
  return true;
}

}  // namespace aeb_demo
