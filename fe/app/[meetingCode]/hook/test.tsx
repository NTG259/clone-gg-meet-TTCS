// import { OpenVidu } from "openvidu-browser";



// export async function joinRoom() {
//     const OV = new OpenVidu();
//     const session = OV.initSession();
//     const roomName = "test";

//     // ==========================================
//     // 1. XỬ LÝ NGƯỜI KHÁC (REMOTE)
//     // ==========================================
//     session.on("streamCreated", (event: any) => {
//         const connectionId = event.stream.connection.connectionId;
//         console.log("User joined:", connectionId);

//         // Tạo khung chứa video cho người kia
//         const userVideoDiv = document.createElement("div");
//         userVideoDiv.id = "user-" + connectionId;
//         userVideoDiv.className = "video-box";
//         document.getElementById("remote-videos")!.appendChild(userVideoDiv);

//         // Đăng ký nhận luồng Cam/Mic của họ và nhét vào khung vừa tạo
//         const subscriber = session.subscribe(event.stream, userVideoDiv);

//         subscriber.on("videoElementCreated", (e: any) => {
//             const video = e.element;
//             // QUAN TRỌNG: Không set muted = true để nghe được tiếng họ nói
//             video.autoplay = true;
//             video.playsInline = true;

//             video.play().catch((err: any) => console.log("Lỗi autoplay:", err));
//         });
//     });

//     session.on("streamDestroyed", (event: any) => {
//         const connectionId = event.stream.connection.connectionId;
//         const videoDiv = document.getElementById("user-" + connectionId);
//         if (videoDiv) videoDiv.remove(); // Xóa khung video khi họ thoát
//     });

//     // ==========================================
//     // 2. KẾT NỐI VÀO PHÒNG
//     // ==========================================
//     await fetch(`http://100.90.25.32:8080/api/sessions/${roomName}`, { method: "POST" });
//     const tokenResponse = await fetch(
//         `http://100.90.25.32:8080/api/sessions/${roomName}/connections`,
//         { method: "POST" }
//     );
//     const token = await tokenResponse.text();

//     await session.connect(token);

//     // ==========================================
//     // 3. XỬ LÝ BẢN THÂN (LOCAL)
//     // ==========================================
//     // TRUYỀN 'undefined' ĐỂ ẨN CAM CỦA MÌNH TRÊN MÀN HÌNH
//     const publisher = await OV.initPublisherAsync(undefined, {
//         audioSource: undefined, // Lấy Mic mặc định
//         videoSource: undefined, // Lấy Cam mặc định
//         publishAudio: true,     // Bật truyền tiếng đi
//         publishVideo: true,     // BẬT truyền hình ảnh đi cho người khác xem
//         mirror: false
//     });

//     session.publish(publisher);

//     console.log("JOIN SUCCESS - Đang gửi Cam/Mic đi, nhận Cam/Mic đối phương!");
// }

