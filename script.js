console.log('Lets write JavaScript')

let currentSong = null; // Keep track of the currently playing audio
let songs;
let currFolder;

function secondsToMinutes(seconds) {
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let response = await fetch(`/${folder}/`)
    let text = await response.text()
    let div = document.createElement("div")
    div.innerHTML = text
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    return songs
}

const playMusic = (track, autoplay = false) => {
    if (currentSong) {
        currentSong.pause()
        currentSong.currentTime = 0
    }

    currentSong = new Audio(`/${currFolder}/` + encodeURIComponent(track))
    if (autoplay) {
        currentSong.play()
        play.src = "assets/pause.svg"
    }

    let songName = decodeURIComponent(track.replace(".mp3", "").split(" - ")[0])
    document.querySelector(".songinfo").innerHTML = songName
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    currentSong.addEventListener('timeupdate', updateSeekBar)

    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML = 
            `00:00 / ${secondsToMinutes(currentSong.duration)}`;
    });

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = 
        `${secondsToMinutes(currentSong.currentTime)} / 
        ${secondsToMinutes(currentSong.duration)}`;
    });
}

const updateSeekBar = () => {
    const seekBar = document.querySelector('.seekbar')
    const circle = document.querySelector('.circle')
    const progress = (currentSong.currentTime / currentSong.duration) * 100
    circle.style.left = progress + '%'
}

async function loadPlaylist(folder, autoplay = false) {
    songs = await getSongs(folder)
    console.log(songs)

    let songUL = document.querySelector(".songlist ul")
    songUL.innerHTML = ''

    for (const song of songs) {
        let songName = decodeURIComponent(song.replace(".mp3", "")).split(" - ")[0];
        let artist = decodeURIComponent(song.replace(".mp3", "")).split(" - ")[1];

        let li = document.createElement("li")
        li.setAttribute("data-fullname", song)
        li.innerHTML = `
            <img class="invert" src="assets/music.svg" alt="">
            <div class="info">
                <div>${songName}</div>
                <div>${artist}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="assets/play.svg" alt="">
            </div>`
        songUL.appendChild(li)

        li.addEventListener("click", function() {
            let fullSongName = li.getAttribute("data-fullname")
            if (fullSongName) {
                playMusic(fullSongName.trim(), true)
            } else {
                console.error("data-fullname attribute is missing")
            }
        })
    }

    if (songs.length > 0) {
        playMusic(songs[0], autoplay);
    }
}

async function main() {
    await loadPlaylist("songs/ncs", false)

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/pause.svg"
        } else {
            currentSong.pause()
            play.src = "assets/play.svg"
        }
    })

    const seekBar = document.querySelector('.seekbar');
    seekBar.addEventListener("click", seek);
    seekBar.addEventListener("mousedown", startDragging);
    seekBar.addEventListener("mouseup", stopDragging);

    function seek(event) {
        if (currentSong) {
            const seekBarRect = seekBar.getBoundingClientRect();
            const clickPosition = event.clientX - seekBarRect.left;
            const newPosition = (clickPosition / seekBar.offsetWidth) * currentSong.duration;
            currentSong.currentTime = newPosition;
            updateSeekBar();
        }
    }

    let isDragging = false;
    function startDragging() {
        if (currentSong) {
            isDragging = true;
            document.addEventListener("mousemove", dragSeekBar);
            document.addEventListener("mouseup", stopDragging);
        }
    }

    function stopDragging() {
        if (isDragging) {
            document.removeEventListener("mousemove", dragSeekBar);
            isDragging = false;
        }
    }

    function dragSeekBar(event) {
        if (currentSong) {
            const seekBarRect = seekBar.getBoundingClientRect();
            const clickPosition = event.clientX - seekBarRect.left;
            const newPosition = (clickPosition / seekBar.offsetWidth) * currentSong.duration;
            currentSong.currentTime = newPosition;
            updateSeekBar();
        }
    }

    const updateSeekBar = () => {
        if (currentSong) {
            const seekBar = document.querySelector('.seekbar')
            const circle = document.querySelector('.circle')
            const progress = (currentSong.currentTime / currentSong.duration) * 100
            circle.style.left = progress + '%'
            document.querySelector(".songtime").innerHTML = 
                `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;
        }
    }

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    document.querySelector("#previous").addEventListener("click", ()=>{
        console.log("Previous clicked")
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))
        if((index - 1) >= 0){
            playMusic(songs[index - 1], true)
        }
    })
    
    document.querySelector("#next").addEventListener("click", ()=>{
        console.log("Next clicked")
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]))
        if((index + 1) < songs.length){
            playMusic(songs[index + 1], true)
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log(e, e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value)/100
    })

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e)
        e.addEventListener("click", async item => {
            await loadPlaylist(`songs/${item.currentTarget.dataset.folder}`, true)
        })
    });

    document.querySelector(".signupbtn").addEventListener("click", () => {
        alert("Feature Coming Soon!");
    });

    document.querySelector(".loginbtn").addEventListener("click", () => {
        alert("Feature Coming Soon!");
    });

    const homeIcon = document.querySelector(".home ul li:nth-child(1)");
    const searchIcon = document.querySelector(".home ul li:nth-child(2)");

    homeIcon.addEventListener("click", () => {
        alert("You are already at Home menu");
    });

    searchIcon.addEventListener("click", () => {
        alert("Feature Coming Soon!");
    });

    document.querySelector(".volume>img").addEventListener("click", e=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            e.target.src = e.target.src.replace("assets/mute.svg", "assets/mute.svg") // enforce correct path
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            e.target.src = e.target.src.replace("assets/volume.svg", "assets/volume.svg") // enforce correct path
            currentSong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
    })

    var moonicon = document.getElementById("moonicon");

    moonicon.onclick = function() {
        document.body.classList.toggle("dark-theme");

        if (document.body.classList.contains("dark-theme")) {
            moonicon.src = "assets/sun.svg";
        } else {
            moonicon.src = "assets/dark.svg";
        }
    };
}

main();
