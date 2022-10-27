import './GSProgressBar.sass'
import React, {useEffect, useState} from 'react'
import {array, arrayOf, bool, func, number, oneOf, shape, string} from 'prop-types'
import {Trans} from 'react-i18next'
import moment from 'moment'

const GSProgressBar = props => {
    const { steps, currentStep, timelines, isCancelledStage, cancelledRemovableStage, replacers } = props

    const [stSteps, setStSteps] = useState([])

    useEffect(() => {
        if (!steps.length) {
            return
        }

        if (isCancelledStage) {
            const _steps = _.clone(steps)

            if (cancelledRemovableStage > -1) {
                _steps.splice(cancelledRemovableStage - 1, 1)
            }

            setStSteps(_steps)
        } else {
            //Remove cancelled step because UI no need to show cancelled icon in progress
            setStSteps(steps.slice(0, steps.length - 1))
        }
    }, [steps, currentStep, isCancelledStage])

    const renderStepIcon = () => {
        let children = []

        for (let i = 0; i < stSteps.length; i++) {
            const stateIcon = []

            if (isCancelledStage && i + 1 > currentStep) {
                if (stSteps[i] === 'cancelled') {
                    //Render cancelled stage
                    stateIcon.push(
                        <div
                            key={ 'p' + i }
                            className={
                                [
                                    'step__progress',
                                    currentStep >= (i + 1) ? `step__progress--active delay-${ i }` : ''
                                ].join(' ')
                            }
                        />
                    )
                    stateIcon.push(
                        <div key={ i } className="step step--cancel--active"
                             onClick={ () => onClickChangeStep(i) }>
                        </div>
                    )

                    children.push(
                        <td key={ i } className="position-relative">
                            { stateIcon }
                        </td>
                    )
                }
                continue
            }

            //Render active stage
            if (i !== 0) {
                //Don't render first progress line
                stateIcon.push(<div
                    key={ 'p' + i }
                    className={
                        [
                            'step__progress',
                            currentStep >= (i + 1) ? `step__progress--active delay-${ i }` : ''
                        ].join(' ')
                    }
                />)
            }

            stateIcon.push(
                <div key={ i }
                     className={ [
                         'step',
                         currentStep >= (i + 1) ? 'step--active' : 'step--inactive'
                     ].join(' ') }
                     onClick={ () => onClickChangeStep(i) }>
                </div>
            )

            children.push(
                <td key={ i } className="position-relative">
                    { stateIcon }
                </td>
            )
        }

        return (
            <tr className="step__bar">
                { children }
            </tr>
        )
    }

    const onClickChangeStep = (stepIndex) => {
    }

    const renderStepLabel = () => {
        let children = []
        for (let i = 0; i < stSteps.length; i++) {
            const replacer = replacers.find(r => r.step?.toLowerCase() === stSteps[i])

            if (isCancelledStage && i + 1 > currentStep) {
                if (stSteps[i] === 'cancelled') {
                    //Render cancelled label
                    children.push(
                        <td key={ i } className="step__label step__label--active">
                            <span>
                                {
                                    replacer?.isReplace
                                        ? replacer.label
                                        : <Trans i18nKey={ `progress.bar.step.${ stSteps[i] }` }/>
                                }
                            </span>
                        </td>
                    )
                }
                continue
            }

            //Render active label
            children.push(
                <td key={ i } className={ [
                    'step__label',
                    currentStep >= (i + 1) ? 'step__label--active' : 'step__label--inactive'
                ].join(' ') }>
                    <span>
                        {
                            replacer?.isReplace
                                ? replacer.label
                                : <Trans i18nKey={ `progress.bar.step.${ stSteps[i] }` }/>
                        }
                    </span>
                </td>
            )
        }

        return (
            <tr className="step__text">
                { children }
            </tr>
        )
    }

    const renderStepTimeLine = () => {
        if (!timelines.length) {
            return
        }

        let children = []

        for (let i = 0; i < stSteps.length; i++) {
            const timeLine = timelines.find(timeline => timeline.status?.toLowerCase() === stSteps[i])

            if (!timeLine) {
                children.push(
                    <td key={ i } className="step__time-line">
                    </td>
                )

                continue
            }

            const timeLineMM = moment(timeLine.createdDate)

            children.push(
                <td key={ i } className="step__time-line">
                    <div>{ timeLineMM.format('HH:mm') }</div>
                    <div>{ timeLineMM.format('DD/MM/YYYY') }</div>
                </td>
            )
        }

        return (
            <tr className="step__text">
                { children }
            </tr>
        )
    }

    return (
        <div className="progress-step-navigation">
            <table>
                { renderStepIcon() }
                { renderStepLabel() }
                { renderStepTimeLine() }
            </table>
        </div>
    )
}

GSProgressBar.defaultProps = {
    currentStep: 1,
    cancelledRemovableStage: -1,
    steps: [],
    timelines: [],
    replacers: []
}

GSProgressBar.propTypes = {
    currentStep: number,
    steps: array,
    isCancelledStage: bool,
    cancelledRemovableStage: number,
    timelines: arrayOf(shape({
        status: string,
        createdDate: string
    })),
    replacers: arrayOf(shape({
        step: number,
        label: string,
        isReplace: bool
    }))
}

export default GSProgressBar
