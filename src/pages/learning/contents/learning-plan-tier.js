import {PACKAGES_ID} from "./packages"
import {LearningUtils} from "../utils/learning-utils";
import {LEARNING_COMMON_STEP_CONTENT_ID, LEARNING_COMMON_TAB_ID, TUTORIAL_VIDEOS} from "./common";


export const assetPrefix = '/assets/images/tutorial_guide/free_tier_flow/free_tier_flow-'

const PACKAGE_NAME = PACKAGES_ID.TIER + "_"


export const STEPS_LIST = [
    LearningUtils.createStepsListItem(LEARNING_COMMON_TAB_ID.LAZADA, LEARNING_COMMON_STEP_CONTENT_ID.STEP_0001, 1),
    LearningUtils.createStepsListItem(LEARNING_COMMON_TAB_ID.SHOPEE, LEARNING_COMMON_STEP_CONTENT_ID.STEP_0002, 2),
    LearningUtils.createStepsListItem(LEARNING_COMMON_TAB_ID.GOMUA, LEARNING_COMMON_STEP_CONTENT_ID.STEP_0003, 3),
    LearningUtils.createStepsListItem(LEARNING_COMMON_TAB_ID.PRODUCT, LEARNING_COMMON_STEP_CONTENT_ID.STEP_0004, 4),
    LearningUtils.createStepsListItem(LEARNING_COMMON_TAB_ID.CUSTOMER, LEARNING_COMMON_STEP_CONTENT_ID.STEP_0005, 5),
    LearningUtils.createStepsListItem(LEARNING_COMMON_TAB_ID.ORDER, LEARNING_COMMON_STEP_CONTENT_ID.STEP_0006, 6, "page.learning.congratulationPage.text1"),
]

export const STEPS_CONTENT = [
    LearningUtils.createStepsContentItem(LEARNING_COMMON_STEP_CONTENT_ID.STEP_0001, [TUTORIAL_VIDEOS.LAZADA,'02->04']),
    LearningUtils.createStepsContentItem(LEARNING_COMMON_STEP_CONTENT_ID.STEP_0002, [TUTORIAL_VIDEOS.SHOPEE, '06->09']),
    LearningUtils.createStepsContentItem(LEARNING_COMMON_STEP_CONTENT_ID.STEP_0003, ['11->13']),
    LearningUtils.createStepsContentItem(LEARNING_COMMON_STEP_CONTENT_ID.STEP_0004, [TUTORIAL_VIDEOS.PRODUCT,'15->29']),
    LearningUtils.createStepsContentItem(LEARNING_COMMON_STEP_CONTENT_ID.STEP_0005, [TUTORIAL_VIDEOS.CUSTOMER_IMPORT, '31->32']),
    LearningUtils.createStepsContentItem(LEARNING_COMMON_STEP_CONTENT_ID.STEP_0006, [TUTORIAL_VIDEOS.FREE_TIER_ORDER,'34->38']),
]

