export default function fullScreen(id,prop){
    let element;
    return {
        methods:{
            changeScreen(){
                element=element||document.getElementById(id)
                console.log(element)
                if(!this[prop]){
                    this.fullScreen();
                    this[prop]=true;
                }else{
                    this.fullExit()
                    this[prop]=false
                }
            },
            fullScreen() {
                //IE 10及以下ActiveXObject  
                // if (window.ActiveXObject) {
                //     var WsShell = new ActiveXObject('WScript.Shell')
                //     WsShell.SendKeys('{F11}');
                // }
                //HTML W3C 提议  
                 if (element.requestFullScreen) {
                    element.requestFullScreen();
                }
                //IE11  
                else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
                // Webkit (works in Safari5.1 and Chrome 15)  
                else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                }
                // Firefox (works in nightly)  
                else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                }
            },
            
            //退出全屏  
             fullExit() {
                if (window.ActiveXObject) {
                    var WsShell = new ActiveXObject('WScript.Shell')
                    WsShell.SendKeys('{F11}');
                }
                //HTML5 W3C 提议  
                else if (element.requestFullScreen) {
                    document.exitFullscreen();
                }
                //IE 11  
                else if (element.msRequestFullscreen) {
                    document.msExitFullscreen();
                }
                // Webkit (works in Safari5.1 and Chrome 15)  
                else if (element.webkitRequestFullScreen) {
                    document.webkitCancelFullScreen();
                }
                // Firefox (works in nightly)  
                else if (element.mozRequestFullScreen) {
                    document.mozCancelFullScreen();
                }
            }
        }
    }
}