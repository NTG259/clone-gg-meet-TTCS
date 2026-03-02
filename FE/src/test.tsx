import { OpenVidu } from "openvidu-browser";

const OV = new OpenVidu(); const session = OV.initSession();
export async function joinRoom() {
    const roomName = "testabcd";
    await fetch(`http://100.90.25.32:8080/api/sessions/${roomName}`,
        { method: "POST" });
    const tokenResponse = await fetch(`http://100.90.25.32:8080/api/sessions/${roomName}/connections`,
        { method: "POST" });
    const token = await tokenResponse.text();
    console.log(token);
    await session.connect(token);

    const publisher = await OV.initPublisherAsync(undefined, { audioSource: undefined, videoSource: undefined, publishAudio: true, publishVideo: true });
    session.publish(publisher);
    console.log("Connected successfully");
}