#include "aeb_demo/algorithm/simple_aeb_algorithm.hpp"
#include "aeb_demo/transport/udp_h264_receiver.hpp"

#if defined(AEB_DEMO_ENABLE_GSTREAMER)
#include "aeb_demo/decoder/gstreamer_h264_decoder.hpp"
#endif

#include <rclcpp/rclcpp.hpp>
#include <std_msgs/msg/string.hpp>

#include <memory>
#include <sstream>

namespace {

std::string DecisionToString(const aeb_demo::AebDecision& decision) {
  std::ostringstream output;
  output << "{"
         << "\"frame_id\":" << decision.frame_id << ","
         << "\"timestamp_ns\":" << decision.timestamp_ns << ","
         << "\"should_brake\":" << (decision.should_brake ? "true" : "false") << ","
         << "\"confidence\":" << decision.confidence << ","
         << "\"reason\":\"" << decision.reason << "\""
         << "}";
  return output.str();
}

}  // namespace

class AebDemoNode final : public rclcpp::Node {
 public:
  AebDemoNode()
      : Node("aeb_demo_node"),
        receiver_(BuildReceiverConfig()),
        algorithm_(BuildAebConfig()) {
    publisher_ = create_publisher<std_msgs::msg::String>("/aeb/decision", 10);

#if defined(AEB_DEMO_ENABLE_GSTREAMER)
    decoder_ = std::make_unique<aeb_demo::GstreamerH264Decoder>();
    if (!decoder_->Initialize(BuildDecoderConfig())) {
      RCLCPP_ERROR(get_logger(), "Failed to initialize Orin GStreamer H.264 decoder");
    }
#else
    RCLCPP_ERROR(
        get_logger(),
        "AEB_DEMO_ENABLE_GSTREAMER is OFF; node cannot decode H.264 frames");
#endif

    if (!receiver_.Start()) {
      RCLCPP_ERROR(get_logger(), "Failed to start UDP H.264 receiver");
    }

    timer_ = create_wall_timer(
        std::chrono::milliseconds(5),
        [this]() {
          Tick();
        });
  }

  ~AebDemoNode() override {
    receiver_.Stop();
  }

 private:
  aeb_demo::UdpReceiverConfig BuildReceiverConfig() {
    aeb_demo::UdpReceiverConfig config;
    config.listen_ip = declare_parameter<std::string>("udp.listen_ip", "0.0.0.0");
    config.port = static_cast<std::uint16_t>(declare_parameter<int>("udp.port", 5600));
    config.receive_buffer_bytes =
        static_cast<std::uint32_t>(declare_parameter<int>("udp.receive_buffer_bytes", 4194304));
    config.receive_timeout_ms =
        static_cast<std::uint32_t>(declare_parameter<int>("udp.receive_timeout_ms", 10));
    return config;
  }

  aeb_demo::DecoderConfig BuildDecoderConfig() {
    aeb_demo::DecoderConfig config;
    config.width = static_cast<std::uint32_t>(declare_parameter<int>("video.width", 1920));
    config.height = static_cast<std::uint32_t>(declare_parameter<int>("video.height", 1536));
    config.low_latency = declare_parameter<bool>("decoder.low_latency", true);
    return config;
  }

  aeb_demo::SimpleAebConfig BuildAebConfig() {
    aeb_demo::SimpleAebConfig config;
    config.roi_x = static_cast<std::uint32_t>(declare_parameter<int>("aeb.roi_x", 480));
    config.roi_y = static_cast<std::uint32_t>(declare_parameter<int>("aeb.roi_y", 768));
    config.roi_width = static_cast<std::uint32_t>(declare_parameter<int>("aeb.roi_width", 960));
    config.roi_height = static_cast<std::uint32_t>(declare_parameter<int>("aeb.roi_height", 600));
    config.dark_pixel_threshold =
        static_cast<std::uint8_t>(declare_parameter<int>("aeb.dark_pixel_threshold", 80));
    config.brake_ratio_threshold =
        static_cast<float>(declare_parameter<double>("aeb.brake_ratio_threshold", 0.65));
    config.trigger_confirm_frames =
        static_cast<std::uint32_t>(declare_parameter<int>("aeb.trigger_confirm_frames", 3));
    return config;
  }

  void Tick() {
    aeb_demo::H264Frame h264_frame;
    if (!receiver_.ReadFrame(&h264_frame)) {
      return;
    }

#if defined(AEB_DEMO_ENABLE_GSTREAMER)
    if (decoder_ == nullptr) {
      return;
    }

    aeb_demo::YuvFrame yuv_frame;
    if (!decoder_->Decode(h264_frame, &yuv_frame)) {
      RCLCPP_WARN_THROTTLE(get_logger(), *get_clock(), 1000, "Failed to decode H.264 frame");
      return;
    }

    const aeb_demo::AebDecision decision = algorithm_.Process(yuv_frame);
    std_msgs::msg::String message;
    message.data = DecisionToString(decision);
    publisher_->publish(message);
#endif
  }

  aeb_demo::UdpH264Receiver receiver_;
  aeb_demo::SimpleAebAlgorithm algorithm_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
  rclcpp::TimerBase::SharedPtr timer_;

#if defined(AEB_DEMO_ENABLE_GSTREAMER)
  std::unique_ptr<aeb_demo::H264Decoder> decoder_;
#endif
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<AebDemoNode>());
  rclcpp::shutdown();
  return 0;
}
