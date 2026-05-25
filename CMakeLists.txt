cmake_minimum_required(VERSION 3.20)

project(aeb_demo VERSION 0.1.0 LANGUAGES CXX)

option(AEB_DEMO_BUILD_TESTING "Build AEB demo tests" ON)
option(AEB_DEMO_ENABLE_GSTREAMER "Build GStreamer hardware decoder backend" OFF)
option(AEB_DEMO_ENABLE_ROS2 "Build ROS2 node integration" OFF)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE RelWithDebInfo CACHE STRING "Build type" FORCE)
endif()

add_library(aeb_demo_core
  src/common/latest_frame_buffer.cpp
  src/algorithm/simple_aeb_algorithm.cpp
  src/transport/annex_b_parser.cpp
)

target_include_directories(aeb_demo_core
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_options(aeb_demo_core
  PRIVATE
    -Wall
    -Wextra
    -Wpedantic
    -Werror
)

add_executable(aeb_udp_h264_sender
  tools/aeb_udp_h264_sender.cpp
)

target_link_libraries(aeb_udp_h264_sender
  PRIVATE
    aeb_demo_core
)

if(AEB_DEMO_ENABLE_GSTREAMER)
  find_package(PkgConfig REQUIRED)
  pkg_check_modules(GSTREAMER REQUIRED gstreamer-1.0 gstreamer-app-1.0)

  add_library(aeb_demo_gstreamer_decoder
    src/decoder/gstreamer_h264_decoder.cpp
  )

  target_include_directories(aeb_demo_gstreamer_decoder
    PUBLIC
      ${GSTREAMER_INCLUDE_DIRS}
  )

  target_link_libraries(aeb_demo_gstreamer_decoder
    PUBLIC
      aeb_demo_core
      ${GSTREAMER_LIBRARIES}
  )

  target_compile_definitions(aeb_demo_gstreamer_decoder
    PUBLIC
      AEB_DEMO_ENABLE_GSTREAMER=1
  )
endif()

if(AEB_DEMO_BUILD_TESTING)
  enable_testing()

  add_executable(test_latest_frame_buffer tests/test_latest_frame_buffer.cpp)
  target_link_libraries(test_latest_frame_buffer PRIVATE aeb_demo_core)
  add_test(NAME test_latest_frame_buffer COMMAND test_latest_frame_buffer)

  add_executable(test_simple_aeb_algorithm tests/test_simple_aeb_algorithm.cpp)
  target_link_libraries(test_simple_aeb_algorithm PRIVATE aeb_demo_core)
  add_test(NAME test_simple_aeb_algorithm COMMAND test_simple_aeb_algorithm)

  add_executable(test_annex_b_parser tests/test_annex_b_parser.cpp)
  target_link_libraries(test_annex_b_parser PRIVATE aeb_demo_core)
  add_test(NAME test_annex_b_parser COMMAND test_annex_b_parser)
endif()
