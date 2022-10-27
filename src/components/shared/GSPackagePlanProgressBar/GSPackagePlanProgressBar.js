import "./GSPackagePlanProgressBar.sass";
import React from "react";
import { array, arrayOf, func, number, shape, string } from "prop-types";
import { Trans } from "react-i18next";
import moment from "moment";

const GSPackagePlanProgressBar = (props) => {
    const { steps, currentStep, timelines, disabledChangeStep, onChangeStep } =
        props;

    const renderStepIcon = () => {
        let children = [];

        for (let i = 1; i <= steps.length; i++) {
            const stateIcon = [];

            if (i !== 1) {
                //Don't render first progress line
                stateIcon.push(
                    <div
                        key={"p" + i}
                        className={[
                            "step__progress",
                            currentStep >= i
                                ? `step__progress--active delay-${i}`
                                : "",
                        ].join(" ")}
                    />
                );
            }

            stateIcon.push(
                <div
                    key={i}
                    className={[
                        "step",
                        currentStep >= i ? "step--active" : "step--inactive",
                        handleChangeStep && i !== disabledChangeStep
                            ? "cursor--pointer"
                            : "",
                    ].join(" ")}
                    onClick={() => handleChangeStep(i)}
                >
                    {i}
                </div>
            );

            children.push(<td className="position-relative">{stateIcon}</td>);
        }

        return <tr className="step__bar">{children}</tr>;
    };

    const handleChangeStep = (stepIndex) => {
        if (stepIndex < currentStep && currentStep !== disabledChangeStep) {
            onChangeStep(stepIndex);
        }
    };

    const renderStepLabel = () => {
        let children = [];
        for (let i = 1; i <= steps.length; i++) {
            children.push(
                <td key={i} className="step__label__col">
                    <span
                        className={[
                            "step__label__col__text",
                            currentStep >= i ? "active" : "",
                        ].join(" ")}
                    >
                        <Trans
                            i18nKey={`component.packagePlanProgressBar.step.${
                                steps[i - 1]
                            }`}
                        />
                    </span>
                </td>
            );
        }

        return <tr className="step__label">{children}</tr>;
    };

    const renderStepTimeLine = () => {
        if (!timelines.length) {
            return;
        }

        let children = [];

        for (let i = 1; i <= steps.length; i++) {
            const timeLine = timelines.find(
                (timeline) => timeline.status.toLowerCase() === steps[i - 1]
            );

            if (!timeLine) {
                continue;
            }

            const timeLineMM = moment(timeLine.createdDate);

            children.push(
                <td key={i} className="step__time-line">
                    <div>{timeLineMM.format("HH:mm")}</div>
                    <div>{timeLineMM.format("DD/MM/YYYY")}</div>
                </td>
            );
        }

        return <tr className="step__text">{children}</tr>;
    };

    return (
        <div className="package-plan-progress-step-navigation">
            <table>
                {renderStepIcon()}
                {renderStepLabel()}
                {renderStepTimeLine()}
            </table>
        </div>
    );
};

GSPackagePlanProgressBar.defaultProps = {
    currentStep: 1,
    steps: [],
    timelines: [],
    onChangeStep: () => {
    }
}

GSPackagePlanProgressBar.propTypes = {
    currentStep: number,
    steps: array,
    timelines: arrayOf(shape({
        status: string,
        createdDate: string
    })),
    disabledChangeStep: number,
    onChangeStep: func
}

export default GSPackagePlanProgressBar
