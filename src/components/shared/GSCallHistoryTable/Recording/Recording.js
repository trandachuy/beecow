import React, {Component} from 'react';
import GSAudioPlayer from "../../GSAudio/GSAudioPlayer";
import './Recording.sass'

class Recording extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showProgress: true,
            refAudio: undefined,
            paused: false
        };
        this.setRefAudio = this.setRefAudio.bind(this);
        this.handleProcess = this.handleProcess.bind(this);
        this.clickTogglePlay = this.clickTogglePlay.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
    }

    componentDidMount() {

    }

    setRefAudio(ref) {
        this.setState({
            refAudio: ref
        },() => {
            this.setState({
                audio: ref.audio,
            })
        })
    }

    changeIcon() {
        this.setState({
            paused: false
        })
    }

    get audio() {
        return this.state.audio;
    }

    handleProcess() {
    }

    clickTogglePlay(){
        if(this.state.refAudio) {
           let paused = this.state.refAudio.togglePlay();
           if(paused) {
               this.props.currentPlay(this.state.refAudio.audio);
           }
           this.setState({
               paused: paused
           })
        }
    }

    handleEnd() {
        this.setState({
            paused: false
        })
    }

    render() {
        return(
           <>
               <GSAudioPlayer
                   ref={this.setRefAudio}
                   source={this.props.src}
                   autoplay={false}
                   onProgress={this.handleProcess}
                   onEnded={this.handleEnd}
               />
               <span className={['icon-call ' , this.state.refAudio && this.state.paused ? 'icon-call-pause' : 'icon-call-play'].join(' ')}
                     onClick={this.clickTogglePlay}
               />
           </>
        )
    }

}
export default Recording;
