const peer = new Peer();
let mediaStream = null;

async function getMediaDevices()
{
	const mediaDevices = await navigator.mediaDevices.enumerateDevices();

	console.log(mediaDevices);
}
getMediaDevices();

peer.on("open", peerId =>
{
	console.log(peerId);
	document.querySelector(".peerId .id").append(peerId);
});

async function getLocalMediaStream()
{
	try
	{
		mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
	}
	catch(e)
	{
		console.warn("Cannot get the camera input!");

		try
		{
			mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
		}
		catch(e)
		{
			console.warn("Cannot get the microphone input!");
		}
	}

	// Locally show the stream
	document.querySelector(".localStream").srcObject = mediaStream;

	return mediaStream;
}

function bindCallEvents(call)
{
	call.on("stream", remoteStream =>
	{
		console.log("Recieved stream (answering)");
		// Show stream in some video/canvas element.
		document.querySelector(".remoteStream").srcObject = remoteStream;
	});

	call.on("close", () =>
	{
		console.log("Call ended!");
	});

	call.on("error", err =>
	{
		console.error("Call error:", err);
	});

}


peer.on("call", call =>
{
	bindCallEvents(call);

	const ringtoneAudioEl = document.querySelector(".ringtoneAudio");

	const callBox = document.createElement("div");
	callBox.classList.add("incomingCall");
	const pickUpBtn = document.createElement("button");

	callBox.append(`New call from ${ call.peer }!`, document.createElement("br"), pickUpBtn);
	pickUpBtn.append("Answer");
	pickUpBtn.addEventListener("click", async () =>
	{
		ringtoneAudioEl.pause();
		ringtoneAudioEl.currentTime = 0;
		callBox.remove();

		mediaStream = await getLocalMediaStream();
		call.answer(mediaStream);
	});

	ringtoneAudioEl.play();
	document.body.append(callBox);
});


document.querySelector(".connect").addEventListener("click", async () =>
{
	mediaStream = await getLocalMediaStream();

	// Calling other person
	const connectionId = document.querySelector(".connectionId").value;
	const call = peer.call(connectionId, mediaStream);
	bindCallEvents(call);
});
