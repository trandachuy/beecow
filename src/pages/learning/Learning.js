/*******************************************************************************
 * Copyright 2017 (C) Mediastep Software Inc.
 *
 * Created on : 21/02/2020
 * Author: Tien Dao <quy.luong@mediastep.com>
 *******************************************************************************/
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types'
import './Learning.sass'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Constants from "../../config/Constant";
import _ from 'lodash'
import {LANGUAGES} from "./contents/languages";
import {PACKAGES_ID, PACKAGES_LIST} from "./contents/packages";
import storageService from "../../services/storage";
import {PACKAGE_PLANS} from "./contents/package-plan-content-config";
import {Trans} from "react-i18next";

const SHOW_STATE = {
    WELCOME_PAGE: "WELCOME_PAGE",
    PACKAGE_PAGE: "PACKAGE_PAGE",
    STEP_PAGE: "STEP_PAGE"
}

const Learning = props => {
    
    const lang = storageService.getFromLocalStorage(Constants.STORAGE_KEY_LANG_KEY)

    const [isShowLearning, setIsShowLearning] = useState(false);
    const [showState, setShowState] = useState(SHOW_STATE.WELCOME_PAGE);

    const [isShowCongratulation, setShowCongratulation] = useState(false);

    // list to store the list packages clicked that have child
    const [lstPackageTrack, setLstPackageTrack] = useState([])

    const [choosenData, setChoosenData] = useState({
        STEPS_CONTENT: undefined,
        STEPS_LIST: undefined,
        TABS_LIST: undefined,
        ASSETS_PREFIX: undefined
    })

    const [learningData, setLearningData] = useState({
        packageObjectList: [], // list of package with > 1 element // package menu to show
        packageObject: undefined,
        stepObject: undefined,
        stepContenList: []
    })

    
    // get the learning processing ==> will use incase have the api
    useEffect(() => {
        setShowState(SHOW_STATE.WELCOME_PAGE)
        storageService.setToLocalStorage("showTutorial", false)
    }, []);


    const openOrCloseLearning = () => {
        const status = !isShowLearning
        storageService.setToLocalStorage("showTutorial", status)
        setIsShowLearning(status)
    }

    const startTutorial = () => {
        // get the current package of the user
        setLearningData({
            ...learningData,
            packageObjectList: PACKAGES_LIST.filter(element => !element.package_parent_id)        
        })

        // show the package list first
        setShowState(SHOW_STATE.PACKAGE_PAGE)
    }

    
    const onPackageChange = (packageId) => {
        // get current package
        const packageHasChoosen = PACKAGES_LIST.find(element => element.package_id === packageId)

        if(packageHasChoosen.sub_packages){

            // show package list
            setShowState(SHOW_STATE.PACKAGE_PAGE)

            // in case a package has package child => load the sub package to list
            setLearningData({
                ...learningData,
                packageObjectList: PACKAGES_LIST.filter(element => element.package_parent_id === packageId),
                packageObject: packageHasChoosen            
            })

            // add track
            let packageTrack = lstPackageTrack
            packageTrack.push(packageHasChoosen)
            setLstPackageTrack(packageTrack)

        }else{
            const newChoosenData = getStepForPackage(packageId)
            if (!newChoosenData) return

            const stepDefault = newChoosenData.STEPS_LIST[0]

            const stepContent = newChoosenData.STEPS_CONTENT.find(content => content.step_id === stepDefault.step_id).lst_content


            // do not show package list
            setShowState(SHOW_STATE.STEP_PAGE)
            
            setChoosenData(newChoosenData)

            setLearningData({
                ...learningData,
                packageObject: packageHasChoosen,
                stepObject: newChoosenData.STEPS_LIST.find(element => element.step_id === stepDefault.step_id),
                stepContenList: stepContent,
            })
        }
    }


    const nextStep = () => {

        // total step
        const totalStep = choosenData.STEPS_LIST.length

        // current step position
        const currentStep = learningData.stepObject.position

        if(learningData.stepObject.congratulation_code && !isShowCongratulation){
            setShowCongratulation(true)
            return;
        }else{
            setShowCongratulation(false)
        }

        if(currentStep < totalStep){

                
                // allow to next step
                const nextStep = currentStep + 1
                const stepObject = choosenData.STEPS_LIST.find(element => element.position === nextStep)
                const stepContent = choosenData.STEPS_CONTENT.find(content => content.step_id === stepObject.step_id).lst_content

                // lst toggle
                let lstToggleData = []
                stepContent.forEach(element => {
                    if(element.toggle_id){
                        lstToggleData.push({toggle_id: element.toggle_id,status: false})
                    }
                })

                setLearningData({
                    ...learningData,
                    stepObject: stepObject,
                    stepContenList: stepContent
                })

                setShowState(SHOW_STATE.STEP_PAGE)

            

        }else {
            movePreOrNext()
        }
    }


    const previousStep = () => {
        setShowCongratulation(false)

        // current step position
        const currentStep = learningData.stepObject.position

        if(currentStep > 1){

            // allow to next step
            const preStep = currentStep - 1
            const stepObject = choosenData.STEPS_LIST.find(element => element.position === preStep)
            const stepContent = choosenData.STEPS_CONTENT.find(content => content.step_id === stepObject.step_id).lst_content

            // lst toggle
            let lstToggleData = []
            stepContent.forEach(element => {
                if(element.toggle_id){
                    lstToggleData.push({toggle_id: element.toggle_id,status: false})
                }
            })

            setLearningData({
                ...learningData,
                stepObject: stepObject,
                stepContenList: stepContent
            })

            setShowState(SHOW_STATE.STEP_PAGE)

        }else{
            movePreOrNext()
        }
    }


    const backToParentPackage = () => {
        setShowCongratulation(false)
        
        let packageObject = learningData.packageObject
       
        if(packageObject.package_parent_id){
            packageObject = PACKAGES_LIST.find(element => element.package_id === packageObject.package_parent_id)
        }

        // back to parent level
        setLearningData({
            packageObjectList: PACKAGES_LIST.filter(element => !element.package_parent_id),
            packageObject: packageObject 
        })

        // remove the package trace
        let packagesTrack = lstPackageTrack
        if(packagesTrack && packagesTrack.length > 0){
            packagesTrack.pop()
        }
        setLstPackageTrack(packagesTrack)


        // show package list
        setShowState(SHOW_STATE.PACKAGE_PAGE)
    }

    const movePreOrNext = () =>{
        // may go to the next package
        const packageObjectList = learningData.packageObjectList

        const packageObject = learningData.packageObject

        // check if the step is in the sub package
        const packageSublevel = packageObjectList.filter(element => element.package_parent_id).length > 0 ? true : false

        if(packageSublevel){
            // back to sub level
            setLearningData({
                packageObjectList: packageObjectList,
                packageObject: packageObject 
            })

        }else {
            // back to parent level
            setLearningData({
                packageObjectList: PACKAGES_LIST.filter(element => !element.package_parent_id),
                packageObject: packageObject     
            })
        }

        // show package list
        setShowState(SHOW_STATE.PACKAGE_PAGE)
    }

    const getStepForPackage = (packageId) => {
        switch (packageId) {
            case PACKAGES_ID.TIER:
                return PACKAGE_PLANS.FREE_TIER
            case PACKAGES_ID.WEB_PRODUCT:
                return PACKAGE_PLANS.WEB_PRODUCT
            case PACKAGES_ID.WEB_PRODUCT_SERVICE:
                return PACKAGE_PLANS.WEB_SERVICE
            case PACKAGES_ID.APP_PRODUCT:
                return PACKAGE_PLANS.APP_PRODUCT
            case PACKAGES_ID.APP_PRODUCT_SERVICE:
                return PACKAGE_PLANS.APP_SERVICE
            case PACKAGES_ID.INSTORE:
                return PACKAGE_PLANS.IN_STORE
            default:
                return null
        }

    }


    const genContent = (content) => {

        const createImageDOM = (imgIndex) => {
            return (<img src={choosenData.ASSETS_PREFIX + imgIndex + '.jpg'} key={imgIndex} alt={imgIndex}/>)
        }

        return content.map(imgIndex => {
            if (isNaN(imgIndex)) {
                // find spread
                if (imgIndex.includes('->')) {
                    const [start,end] = imgIndex.split('->')
                    const paddingLength = start.length
                    const imageList = []
                    for (let fIndex = parseInt(start); fIndex <= parseInt(end); fIndex++) {
                        imageList.push(createImageDOM(String(fIndex).padStart(paddingLength, '0')))
                    }
                    return imageList
                }
                return genVideo(imgIndex)
            }
                return createImageDOM(imgIndex)
        })
    }

    const genVideo = (content) => {
        return (
            <div className="video-type">
                <iframe width="100%" height="450px" src={content}>
                </iframe>
            </div>
        )
    }


    //========================================================GEN PAGE========================================================
    let totalShowState = showState
    
    let childMenu = false
    let packageParentName = ""

    let currentStep
    let totalStep
    let tabName
    let packageInfo = ""

    if(isShowLearning){
        if(totalShowState === SHOW_STATE.PACKAGE_PAGE && learningData.packageObjectList && learningData.packageObjectList.length > 0){
            totalShowState = SHOW_STATE.PACKAGE_PAGE
        }

        if(totalShowState === SHOW_STATE.PACKAGE_PAGE){

            // is submenu ?
            const isChild = learningData.packageObjectList.filter(element => element.package_parent_id).length > 0
            if(isChild){
                childMenu = true
                
                // get name of parent package if in the sub menu
                if(lstPackageTrack && lstPackageTrack.length > 0){
                    const parent = lstPackageTrack[lstPackageTrack.length - 1]
                    packageParentName = LANGUAGES[parent.package_name_code + "_" + lang]
                } 
            }

        }else if(totalShowState === SHOW_STATE.STEP_PAGE){

            // current step
            currentStep = learningData.stepObject.position

            // number of step
            totalStep = choosenData.STEPS_LIST.length

            // the tab name
            tabName = LANGUAGES[learningData.stepObject.tab_id + "_" + lang]
            
            packageInfo = (<span className="lst-package__name">
                                {
                                    lstPackageTrack.map(element => {return (<span>{LANGUAGES[element.package_name_code + "_" + lang]}</span>)})
                                }

                                <span className={(lstPackageTrack && lstPackageTrack.length > 0) ? "final-package" : ""}>
                                    {LANGUAGES[learningData.packageObject.package_name_code + "_" + lang]}
                                </span>
                                    
            </span>)
        }
    }
    

    return (
        <>
            <div className={["learning-processing__popup", storageService.get(Constants.STORAGE_KEY_ACCESS_TOKEN) ? "" : "hide"].join(" ")} id="learning-processing__popup">

                <div className="learning-processing__icon" onClick={openOrCloseLearning}>
                    <img src="/assets/images/icon-tutorial.svg" alt="tutorial"/>
                </div>
                
                
                {
                    <div className={["learning-processing__content", !isShowLearning ? "hide" : "" ].join(" ")} id="learning-processing__content">

                        {/* ///////////////////////////////////////////// FOR MENU ///////////////////////////////////////////// */}
                        {
                            totalShowState === SHOW_STATE.PACKAGE_PAGE &&
                            <div className="package-menu-or__page">
                                <div className="header-bar for-menu">
                                    {
                                        !childMenu &&
                                        <span><Trans i18nKey="page.learning.welcomePage.gosellTutorial"/></span>
                                    }
                                    {
                                        childMenu &&
                                        <span>{packageParentName}</span>
                                    }
                                </div>
                                <div className="content-container">
                                    <div className="menu">
                                        {
                                            learningData.packageObjectList.map(packageObj => {
                                                return (
                                                    <div 
                                                        className={["menu-row", (learningData.packageObject && packageObj.package_id === learningData.packageObject.package_id) ? "active" : "in-active"].join(" ")} 
                                                        key={"menu_" + packageObj.package_id} 
                                                        onClick={() => onPackageChange(packageObj.package_id)}
                                                    >
                                                        <div className="name">
                                                            {LANGUAGES[packageObj.package_name_code + "_" + lang]}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                    
                                    {
                                        childMenu && 
                                        <>
                                            <div className="line">
                                                <div></div>
                                            </div>
                                            <div className="footer">
                                                <div className="arrow left grey" onClick={backToParentPackage}>
                                                    <div className="icon"><FontAwesomeIcon icon="long-arrow-alt-left"/></div>
                                                    <div className="text"><Trans i18nKey="page.learning.text.previousStep"/></div>
                                                </div>
                                            </div>
                                        </>
                                    }
                                    
                                    
                                </div>
                            </div>
                        }
                        
                        

                        {/* ///////////////////////////////////////////// FOR PAGE ///////////////////////////////////////////// */}
                        {
                            totalShowState === SHOW_STATE.STEP_PAGE &&
                            <div className="package-menu-or__page">
                                <div className="header-bar for-page">
                                    {packageInfo}
                                    <span>{tabName}</span>
                                    {
                                        (currentStep <= totalStep) &&
                                        <span>{(currentStep) + "/" + totalStep}</span>
                                    }
                                </div>
                                <div className="content-container">
                                    <div className="content gs-atm__scrollbar-1">

                                        {/* NORMAL STEP */}
                                        {
                                            (!isShowCongratulation) &&
                                                genContent(learningData.stepContenList)
                                        }

                                        {/* IN CASE END STEP => SHOW THE END PAGE */}
                                        {
                                            (isShowCongratulation) &&
                                            <div className="page-end__step">
                                                <div className="congratulation-text"><Trans i18nKey="page.learning.congratulationPage.congratulation"/></div>
                                                {/* <div className="finish-text">
                                                    <span className="finish"><Trans i18nKey="page.learning.congratulationPage.completed"/></span>
                                                    <span className="tutorial-name">{tabName}</span>
                                                </div> */}
                                              
                                                    <div className="greate-text">
                                                        <Trans i18nKey={learningData.stepObject.congratulation_code}/>
                                                    </div>
                                                
                                                
                                                <div className="background">
                                                    <img src="/assets/images/icon-tutorial-congratulation.svg" alt="congratulation"/>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    <div className="line">
                                        <div></div>
                                    </div>
                                    <div className="footer">
                                        <div className="arrow left grey" onClick={previousStep}>
                                            <div className="icon"><FontAwesomeIcon icon="long-arrow-alt-left"/></div>
                                            <div className="text"><Trans i18nKey="page.learning.text.previousStep"/></div>
                                        </div>
                                        <div className="arrow right blue" onClick={nextStep}>
                                            <div className="icon"><FontAwesomeIcon icon="long-arrow-alt-right"/></div>
                                            <div className="text"><Trans i18nKey="page.learning.text.nextStep"/></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        {/* ///////////////////////////////////////////// FOR WELCOME PAGE ///////////////////////////////////////////// */}
                        {
                            totalShowState === SHOW_STATE.WELCOME_PAGE &&
                            <div className="gs-atm__scrollbar-1 welcome-page">
                                <div className="welcome-page-content">
                                    <div className="hello-text"><Trans i18nKey="page.learning.welcomePage.hello"/></div>
                                    <div className="welcome-text">
                                        <span className="welcome"><Trans i18nKey="page.learning.welcomePage.welcomeTo"/></span>
                                        <span className="gosell-tutorial"><Trans i18nKey="page.learning.welcomePage.gosellTutorial"/></span>
                                    </div>
                                    <div className="start-button" onClick={startTutorial}>
                                        <span><Trans i18nKey="page.learning.welcomePage.button.start"/></span>
                                    </div>
                                    <div className="background">
                                        <img src="/assets/images/icon-tutorial-start.svg" alt="tutorial-start"/>
                                    </div>
                                </div>
                                
                            </div>
                        }
                    </div>
                }
                

            </div>
 
            
        </>
    );
};

Learning.propTypes = {
    onClick: PropTypes.func
};

export default Learning;
