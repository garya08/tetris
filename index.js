export const audio = document.getElementById('mainTheme');
export const btnVolume = document.getElementById("volume");
audio.volume = 0.15;

export const btnPause = document.getElementById("pause");

export const btnRestart = document.getElementById('restart');
export const btnContinue = document.getElementById('continue');

export const scoreEl = document.querySelector('.score>span');

export const speedEl = document.querySelector('.speed>span');
export const levelEl = document.querySelector('.level>span');

btnVolume.addEventListener('click', function(e) {
    e.target.classList.toggle("ico")
    if(this.classList.contains('ico')) {
        // console.log("off")
        audio.pause();
    } else {
        audio.play();
    }
})


