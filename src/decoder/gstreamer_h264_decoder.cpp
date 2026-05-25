#include "aeb_demo/decoder/gstreamer_h264_decoder.hpp"

#include <gst/app/gstappsrc.h>
#include <gst/app/gstappsink.h>
#include <gst/gst.h>

#include <cstring>
#include <string>

namespace aeb_demo {

GstreamerH264Decoder::~GstreamerH264Decoder() {
  Shutdown();
}

bool GstreamerH264Decoder::Initialize(const DecoderConfig& config) {
  config_ = config;

  int argc = 0;
  char** argv = nullptr;
  gst_init(&argc, &argv);

  const std::string pipeline_description =
      "appsrc name=h264_src is-live=true do-timestamp=true format=time "
      "caps=video/x-h264,stream-format=byte-stream,alignment=au "
      "! h264parse disable-passthrough=true "
      "! nvv4l2decoder enable-max-performance=true disable-dpb=true "
      "! video/x-raw(memory:NVMM),format=NV12 "
      "! nvvidconv "
      "! video/x-raw,format=NV12 "
      "! appsink name=yuv_sink sync=false max-buffers=1 drop=true";

  GError* error = nullptr;
  pipeline_ = gst_parse_launch(pipeline_description.c_str(), &error);
  if (pipeline_ == nullptr) {
    if (error != nullptr) {
      g_error_free(error);
    }
    return false;
  }

  appsrc_ = gst_bin_get_by_name(GST_BIN(pipeline_), "h264_src");
  appsink_ = gst_bin_get_by_name(GST_BIN(pipeline_), "yuv_sink");
  if (appsrc_ == nullptr || appsink_ == nullptr) {
    Shutdown();
    return false;
  }

  gst_app_sink_set_emit_signals(GST_APP_SINK(appsink_), false);
  gst_app_sink_set_drop(GST_APP_SINK(appsink_), true);
  gst_app_sink_set_max_buffers(GST_APP_SINK(appsink_), 1U);

  return gst_element_set_state(pipeline_, GST_STATE_PLAYING) != GST_STATE_CHANGE_FAILURE;
}

bool GstreamerH264Decoder::Decode(const H264Frame& input, YuvFrame* output) {
  if (pipeline_ == nullptr || appsrc_ == nullptr || appsink_ == nullptr || output == nullptr) {
    return false;
  }

  if (input.data.empty()) {
    return false;
  }

  GstBuffer* buffer = gst_buffer_new_allocate(nullptr, input.data.size(), nullptr);
  if (buffer == nullptr) {
    return false;
  }

  GstMapInfo map_info{};
  if (!gst_buffer_map(buffer, &map_info, GST_MAP_WRITE)) {
    gst_buffer_unref(buffer);
    return false;
  }

  std::memcpy(map_info.data, input.data.data(), input.data.size());
  gst_buffer_unmap(buffer, &map_info);
  GST_BUFFER_PTS(buffer) = static_cast<GstClockTime>(input.timestamp_ns);
  GST_BUFFER_DTS(buffer) = static_cast<GstClockTime>(input.timestamp_ns);

  const GstFlowReturn push_result = gst_app_src_push_buffer(GST_APP_SRC(appsrc_), buffer);
  if (push_result != GST_FLOW_OK) {
    return false;
  }

  return PullSample(input, output);
}

void GstreamerH264Decoder::Shutdown() {
  if (pipeline_ != nullptr) {
    gst_element_set_state(pipeline_, GST_STATE_NULL);
  }

  if (appsrc_ != nullptr) {
    gst_object_unref(appsrc_);
    appsrc_ = nullptr;
  }

  if (appsink_ != nullptr) {
    gst_object_unref(appsink_);
    appsink_ = nullptr;
  }

  if (pipeline_ != nullptr) {
    gst_object_unref(pipeline_);
    pipeline_ = nullptr;
  }
}

bool GstreamerH264Decoder::PullSample(const H264Frame& input, YuvFrame* output) {
  GstSample* sample = gst_app_sink_try_pull_sample(GST_APP_SINK(appsink_), 20000000ULL);
  if (sample == nullptr) {
    return false;
  }

  GstBuffer* buffer = gst_sample_get_buffer(sample);
  if (buffer == nullptr) {
    gst_sample_unref(sample);
    return false;
  }

  GstMapInfo map_info{};
  if (!gst_buffer_map(buffer, &map_info, GST_MAP_READ)) {
    gst_sample_unref(sample);
    return false;
  }

  const std::uint32_t y_size = config_.width * config_.height;
  const std::uint32_t uv_size = y_size / 2U;
  if (map_info.size < static_cast<std::size_t>(y_size + uv_size)) {
    gst_buffer_unmap(buffer, &map_info);
    gst_sample_unref(sample);
    return false;
  }

  output->frame_id = input.frame_id;
  output->timestamp_ns = input.timestamp_ns;
  output->width = config_.width;
  output->height = config_.height;
  output->stride_y = config_.width;
  output->stride_uv = config_.width;
  output->format = PixelFormat::kNv12;
  output->y_plane.assign(map_info.data, map_info.data + y_size);
  output->uv_plane.assign(map_info.data + y_size, map_info.data + y_size + uv_size);

  gst_buffer_unmap(buffer, &map_info);
  gst_sample_unref(sample);
  return true;
}

}  // namespace aeb_demo
