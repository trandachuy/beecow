import React, {useEffect, useRef, useState} from 'react';
import './GSInputDuration.sass'

const GSInputDuration = props => {
    const def = {
        mm: 'mm',
        ss: 'ss'
    }
    const defNumber = {
        N00: '00',
        N01 : '01',
        N99: '99',
        N59: '59'

    }
    const time = {
        minutes: 'minutes',
        seconds: 'seconds'
    }
    const minutesRef = useRef();
    const secondRef = useRef();
    const [refFocus, setRefFocus] = useState();
    const [minutes, setMinutes] = useState('mm');
    const [seconds, setSeconds] = useState('ss');
    const [isFocus, setIsFocus] = useState(undefined);
    const [storeKeyUp, setStoreKeyUp] = useState('');
    const [enableUpDown, setEnableUpDown] = useState(false);
    const [exc, setExc] = useState();

    useEffect(() => {
        if(exc == true) {
            if(minutes != def.mm || seconds != def.ss) {
                props.onSelectedDuration(convertDurationToNumber());
            }else {
                props.onSelectedDuration(-1);
            }
        }
        setExc(false)
    },[exc])

    const onkeyUpInput = (ref, event, callback, def) =>{
        let name = ref.current.name;

        if(event.key == 'Backspace') {
            callback(def)
            return;
        }

        let isNumber = !isNaN(event.key);

        if( !isNumber){
            event.preventDefault(); //stop character from entering input
            return;
        }
        if(storeKeyUp.length == 0){
            callback(`0${event.key}`);
            setStoreKeyUp(event.key);
            if(name == time.seconds && parseInt(event.key) > 5) {
                minutesRef.current.focus()
                return;
            }
        } else {
            let value = storeKeyUp.concat(event.key)
            callback(value);
            if(name == time.minutes) {
                secondRef.current.focus();
            } else {
                setStoreKeyUp(value);
                minutesRef.current.focus()
            }
        }
    }
    const onFocusInput = (ref) => {
        setEnableUpDown(true)
        setStoreKeyUp('');
        setRefFocus(ref)
        let name = ref.current.name;
        if (name == time.minutes) {
            setIsFocus(true)
        } else {
            setIsFocus(false)
        }
    }
    const minutesUpdateIncreaseValue = (value) => {
        if(value == def.mm) {
            setMinutes(defNumber.N01)
        } else {
            let number = parseInt(value);
            number += 1;
            if (number < 10) {
                setMinutes(`0${number}`)
            } else if (number <= 99){
                setMinutes(`${number}`)
            }
            return;
        }
    }

    const minutesUpdateDecreaseValue = (value) => {
        if(value == def.mm || value == defNumber.N00) {
            return false;
        } else {
            let number = parseInt(value);
            number -= 1;
            if (number < 10) {
                setMinutes(`0${number}`)
            } else {
                setMinutes(`${number}`)
            }
        }
        return true;
    }

    const secondsUpdateIncreaseValue = (value) => {
        let minutes = minutesRef.current.value;
        if (minutes == defNumber.N99 && value == defNumber.N59) {
            return;
        } else  if(value == def.ss) {
            setSeconds(defNumber.N01)
        } else {
            let number = parseInt(value);
            number += 1;
            if (number < 10) {
                setSeconds(`0${number}`)
            } else {
                if (number == 60) {
                    setSeconds(defNumber.N00);
                    minutesUpdateIncreaseValue(minutes)
                } else {
                    setSeconds(`${number}`);
                }
            }
        }
    }
    const secondsUpdateDecreaseValue = (value) => {
        if(value == def.ss || value == defNumber.N00) {
            return true;
        } else {
            let number = parseInt(value);
            number -= 1;
            if (number < 10) {
                if(number == -1) {
                    return;
                } else {
                    setSeconds(`0${number}`)
                }
            } else {
                setSeconds(`${number}`)
            }
        }
        return true;
    }

    const onUp = () =>{
        if (refFocus && refFocus.current) {
            let value = refFocus.current.value;
            let name = refFocus.current.name;
            if (name == time.minutes) {
                minutesUpdateIncreaseValue(value);
            } else {
                secondsUpdateIncreaseValue(value)
            }
        }
    }

    const onDown = () =>{
        let focus = true;
        if (refFocus && refFocus.current) {
            let value = refFocus.current.value;
            let name = refFocus.current.name;
            if (name == time.minutes) {
              focus =  minutesUpdateDecreaseValue(value);
            } else {
              focus =  secondsUpdateDecreaseValue(value);
            }
            if(focus) {
                refFocus.current.focus();
            }else {
                secondRef.current.focus();
            }
        }
    }

    const onMouseLeaveAction = () => {
        setIsFocus(undefined)
        setEnableUpDown(false)
        if(refFocus)
            refFocus.current.blur()
        if(minutes != def.mm || seconds != def.ss) {
            if(minutes == def.mm) {
                setMinutes(defNumber.N00)
            } else if (seconds == def.ss){
                setSeconds(defNumber.N00);
            }
        }
        setExc(true)
    }
    const convertDurationToNumber = () => {
        let min = parseInt(minutes);
        let sec = parseInt(seconds);
        return min * 60 + sec;
    }
    return (
        <div className="k-widget k-timepicker"
             onMouseLeave={onMouseLeaveAction}
            >
            <div className={'input-duration'}>
                <input
                    ref={minutesRef}
                    className={['item-child minutes', isFocus ? 'active' : ''].join(' ')}
                    maxLength={2}
                    name={time.minutes}
                    onKeyUp={(e) => onkeyUpInput(minutesRef, e, setMinutes, def.mm)}
                    onFocus={() => onFocusInput(minutesRef)}
                    value={minutes}
                    readOnly={true}
                />
                <div className={'item-child'}>
                    <span>:</span>
                </div>
                <input
                    ref={secondRef}
                    className={['item-child seconds', isFocus == false ? 'active' : ''].join(' ')}
                    maxLength={2}
                    name={time.seconds}
                    onFocus={() => onFocusInput(secondRef)}
                    onKeyUp={(e) => onkeyUpInput(secondRef, e, setSeconds, def.ss)}
                    value={seconds}
                    readOnly={true}
                />
                <div className={'item-child control'} hidden={!enableUpDown}>
                    <span className={'img up'}
                        onClick={onUp}
                    />
                    <span className={'img down'}
                        onClick={onDown}
                    />
                </div>
            </div>
        </div>);
};
export default GSInputDuration


