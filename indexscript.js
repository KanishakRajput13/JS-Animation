const ball= document.getElementById('image');

let angle=0;

function rotate(){
    angle+=2;
    ball.style.transform='rotate('+angle+'deg)';
    requestAnimationFrame(rotate);
}

rotate();

document.getElementById('start-button').addEventListener('click', function() {
    window.location.href = 'game.html';
});