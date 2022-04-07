
interface IWindow extends Window {
    webkitSpeechRecognition: any;
}
interface VCEvent{
    keyword:string,
    callback:Function
}
const { webkitSpeechRecognition }: IWindow = <IWindow><unknown>window;
export class VCAPI {
    private recognition = new webkitSpeechRecognition();
    private listenedEvent:Array<VCEvent>=[];
    constructor(){
        this.recognition.continuous = true;
        this.recognition.lang = 'cmn-Hans-CN'; //普通话 (中国大陆)
        this. recognition.interimResults = true;
        let last_ten_words=''
        this.recognition.onresult=(e:any)=>{
            let resultIndex = e.resultIndex
            let str = e.results[resultIndex][0].transcript
            //console.log(str)
        if(!str.length)return
            let len=str.length
            last_ten_words=str.substr(len-10?len-10:0,len-10?10:len)
            this.listenedEvent.some(e=>{
                const {keyword,callback}=e;
                let start = last_ten_words.indexOf(keyword);//获得字符串的开始位置
                
                if(start>=0){
                    callback()
                }
            })
            //console.log(e)
        }
    }
    stop=()=>{
        this.recognition.stop()
    }
   start=()=>{
       this.recognition.start()
   }
   bindListening=(keyword:string,callback:Function)=>{
    this.listenedEvent.push({
        keyword,
        callback
    })
   }
}