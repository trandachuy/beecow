import React, {useImperativeHandle, useRef} from 'react'
import {bool, func, oneOf} from 'prop-types'
import {useReactToPrint} from 'react-to-print'
import {WindowUtils} from '../../../../utils/download'
import MediaService, {MediaServiceDomain} from '../../../../services/MediaService'
import {ImageUtils} from '../../../../utils/image'
import {GSToast} from '../../../../utils/gs-toast'
import {v4 as uuidv4} from 'uuid'
import ReactDOMServer from 'react-dom/server'
import ThemeEngineUtils from '../../../theme/theme-making/ThemeEngineUtils'
import {FileUtils} from '../../../../utils/file'
import Constants from '../../../../config/Constant'

const PRINT_TYPE = {
    CURRENT_TAB: 'CURRENT_TAB',
    NEW_TAB: 'NEW_TAB',
    UPLOADED_URL: 'UPLOADED_URL',
    DOWNLOADED_URL: 'DOWNLOADED_URL'
}

const Printer = React.forwardRef((props, ref) => {
    const { printType, onUploadedUrl, onDownloadedUrl, children, ...rest } = props

    const refTemplate = useRef(null)

    useImperativeHandle(
        ref,
        () => ({
            print
        })
    )

    const getOrderHTMLChildren = () => {
        return children.find(({ type }) => type.sizes?.includes(props.printSize))
    }

    const handlePrint = useReactToPrint({
        content: () => refTemplate.current
    })

    const print = () => {
        const child = getOrderHTMLChildren()

        if (!child) {
            return
        }

        const html = ThemeEngineUtils.unescape(ReactDOMServer.renderToString(React.cloneElement(child, rest)))
        const file = new File([new Blob([html])], uuidv4(), { type: 'text/html' })

        switch (printType) {
            case PRINT_TYPE.CURRENT_TAB:
                handlePrint()
                onDownloadedUrl()
                return

            case PRINT_TYPE.NEW_TAB:
                WindowUtils.openFileInNewTab(html)

                return

            case PRINT_TYPE.UPLOADED_URL:
                MediaService.uploadFileWithDomain(file, MediaServiceDomain.FILE)
                    .then(res => {
                        try {
                            const url = ImageUtils.getFileUrlFromFileModel(res)

                            onUploadedUrl(url)
                        } catch (e) {
                            console.error(e)
                        }
                    })
                    .catch(e => {
                        onUploadedUrl('')
                        console.error('Cannot upload order file, ' + e)
                        GSToast.commonError()
                    })

                return

            case PRINT_TYPE.DOWNLOADED_URL:
                FileUtils.downloadByFile(file)
                onDownloadedUrl()

                return
        }
    }

    const child = getOrderHTMLChildren()

    if (!child) {
        return
    }

    const { children: templateChildren, ...restChildren } = child.props

    return (
        <div hidden>
            {
                React.cloneElement(templateChildren, {
                    ...restChildren,
                    ref: refTemplate
                })
            }
        </div>
    )
})

Printer.PRINT_TYPE = PRINT_TYPE

Printer.defaultProps = {
    printType: PRINT_TYPE.CURRENT_TAB,
    printEnabled: true,
    onUploadedUrl: function () {
    },
    onDownloadedUrl: function () {
    }
}

Printer.propTypes = {
    printType: oneOf(Object.values(PRINT_TYPE)),
    printSize: oneOf(Object.values(Constants.PAGE_SIZE)),
    printEnabled: bool,
    onUploadedUrl: func,
    onDownloadedUrl: func
}

export default Printer