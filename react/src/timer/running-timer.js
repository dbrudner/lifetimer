import React, {Component} from 'react'
import {Timer, Buttons, TimeBox} from './styles'
import RaisedButton from 'material-ui/RaisedButton'


class RunningTimer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            startTime: Date.now(),
            currentTime: Date.now(),
            seconds: 0,
            minutes: 0,
            hours: 0,
            timerPaused: false,
            breaks: 0,
            startTime: this.props.startTime
        }
    }

    componentDidMount() {
        this.interval = setInterval(this.tick, 100);
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    tick = () => {

        this.setState({
            currentTime: Date.now()
        }, () => {
            const totalSeconds = Math.floor((this.state.currentTime - this.state.startTime)/1000);

            this.setState({
                seconds: totalSeconds
            }, () => {
                if (this.state.seconds > 60) {
                    this.setState({
                        seconds: totalSeconds % 60,
                        minutes: Math.floor(totalSeconds/60)
                    }, () => {
                        if (this.state.minutes > 59) {
                            console.log(totalSeconds)
                            this.setState({
                                minutes: (Math.floor(totalSeconds/60)) % 60,
                                hours: Math.floor(totalSeconds/3600)
                            })
                        }
                    })
                }
            })
        })


    }

    pauseTimer = () => {
        clearInterval(this.interval)
        this.setState({timerPaused: true, breaks: this.state.breaks + 1})

        // Records when a break is taken for logging
        this.props.pauseTimer()
    }

    startTimer = () => {

        this.interval = setInterval(this.tick, 100);
        this.setState({timerPaused: false});

        // Records when a break is finished for logging
        this.props.startTimer()
    }

    renderPauseOrStartButton = () => {
        if (!this.state.timerPaused) {
            return (
                <RaisedButton
                    secondary
                    onClick={this.pauseTimer}
                    label='Take a Break (pause timer)'
                />
            )
        } else {
            return (
                <RaisedButton onClick={this.startTimer}>Finished Break (start timer)</RaisedButton>
            )
        }
    }

    render() {
        const time = this.state

        const pausedStyle = {
            'backgroundColor': 'red'
        }

        const runningStyle = {
            'backgroundColor': 'green'
        }

        if (this.state.breaks > 20) {
            return <Timer>You've taken too many breaks. This session has been recorded, please start a new session.</Timer>
        }

        return (
            <div className='text-center'>
                 <Timer>
                    <h2>
                        {this.props.activity.charAt(0).toUpperCase() + this.props.activity.substr(1) || 'Activity'}
                    </h2>
                    <hr/>
                    <TimeBox>
                        {(this.state.hours < 10 ? '0' + time.hours : time.hours)}:
                        {(this.state.minutes < 10 ? '0' + time.minutes : time.minutes)}:
                        {(this.state.seconds < 10 ? '0' + time.seconds : time.seconds)}
                    </TimeBox>
                        <RaisedButton
                            // style={this.state.timerPaused ? {...pausedStyle} : {...runningStyle}}
                            backgroundColor={this.state.timerPaused ? '#7ca268' : '#ff9c9c'}
                            labelColor='#f3f3f3'
                            onClick={this.state.timerPaused ? this.startTimer : this.pauseTimer}
                            label={!this.state.timerPaused ? 'Take a break (pause timer)' : 'Finished Break (start timer)'}
                            fullWidth
                        />
                        <RaisedButton
                            label='Finish and Log Session'
                            primary
                            onClick={this.props.sessionFinished}
                            style={{marginTop: '1.5rem'}}
                            fullWidth
                        />
                </Timer>
            </div>

        )
    }
}

export default RunningTimer