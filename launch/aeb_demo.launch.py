from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_directory

import os


def generate_launch_description():
    package_share = get_package_share_directory("aeb_demo")
    config_path = os.path.join(package_share, "config", "aeb_demo.yaml")
    intrinsic_path = os.path.join(package_share, "config", "camera_intrinsic.yaml")
    extrinsic_path = os.path.join(package_share, "config", "camera_extrinsic.yaml")

    return LaunchDescription(
        [
            Node(
                package="aeb_demo",
                executable="aeb_demo_node",
                name="aeb_demo_node",
                output="screen",
                parameters=[
                    config_path,
                    {
                        "camera.intrinsic_file": intrinsic_path,
                        "camera.extrinsic_file": extrinsic_path,
                    },
                ],
            )
        ]
    )
