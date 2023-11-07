import React from "react"
import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome/index.js"
import { ExpandableToggle } from "../ExpandableToggle/ExpandableToggle.js"
import {
    HtmlOrSimpleMarkdownText,
    SimpleMarkdownText,
} from "../SimpleMarkdownText.js"

interface IndicatorDescriptionsProps {
    descriptionShort?: string
    descriptionKey?: string[]
    descriptionFromProducer?: string
    attributionShort?: string
    additionalInfo?: string
    hasFaqEntries: boolean
    isEmbeddedInADataPage?: boolean // true by default
}

export const IndicatorDescriptions = (props: IndicatorDescriptionsProps) => {
    const isEmbeddedInADataPage = props.isEmbeddedInADataPage ?? true
    return (
        <div className="indicator-descriptions">
            {props.descriptionKey && props.descriptionKey.length > 0 && (
                <div className="key-info">
                    <h3 className="key-info__title">
                        What you should know about this data
                    </h3>
                    <div className="key-info__content">
                        {props.descriptionKey.length === 1 ? (
                            <SimpleMarkdownText
                                text={props.descriptionKey[0].trim()}
                            />
                        ) : (
                            <ul>
                                {props.descriptionKey.map((text, i) => (
                                    <li key={i}>
                                        <SimpleMarkdownText
                                            text={text.trim()}
                                        />{" "}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {isEmbeddedInADataPage && props.hasFaqEntries && (
                        <a className="key-info__learn-more" href="#faqs">
                            Learn more in the FAQs
                            <FontAwesomeIcon icon={faArrowDown} />
                        </a>
                    )}
                </div>
            )}
            <div className="expandable-info-blocks">
                {props.descriptionFromProducer && (
                    <ExpandableToggle
                        label={
                            props.attributionShort
                                ? `How does the producer of this data - ${props.attributionShort} - describe this data?`
                                : "How does the producer of this data describe this data?"
                        }
                        content={
                            <div className="expandable-info-blocks__content">
                                <SimpleMarkdownText
                                    text={props.descriptionFromProducer.trim()}
                                />
                            </div>
                        }
                        isExpandedDefault={
                            !(props.descriptionShort || props.descriptionKey)
                        }
                        isStacked={!!props.additionalInfo}
                    />
                )}
                {props.additionalInfo && (
                    <ExpandableToggle
                        label="Additional information about this data"
                        content={
                            <div className="expandable-info-blocks__content">
                                <HtmlOrSimpleMarkdownText
                                    text={props.additionalInfo.trim()}
                                />
                            </div>
                        }
                    />
                )}
            </div>
        </div>
    )
}
