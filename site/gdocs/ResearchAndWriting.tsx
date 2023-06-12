import React, { useContext } from "react"
import cx from "classnames"
import {
    EnrichedBlockResearchAndWriting,
    EnrichedBlockResearchAndWritingLink,
} from "@ourworldindata/utils"
import { useLinkedDocument } from "./utils.js"
import { formatAuthors } from "../clientFormatting.js"
import Image from "./Image.js"
import { DocumentContext } from "./OwidGdoc.js"

type ResearchAndWritingProps = {
    className?: string
} & EnrichedBlockResearchAndWriting

function ResearchAndWritingLinkContainer(
    props: EnrichedBlockResearchAndWritingLink & {
        className?: string
        shouldHideThumbnail?: boolean
        shouldHideSubtitle?: boolean
    }
) {
    let {
        value: { url, title, subtitle, authors, filename },
        shouldHideThumbnail = false,
        shouldHideSubtitle = false,
        className,
    } = props
    const { linkedDocument, errorMessage } = useLinkedDocument(url)
    const { isPreviewing } = useContext(DocumentContext)

    if (isPreviewing && errorMessage) {
        return (
            <div className={cx(className, "research-and-writing-link--error")}>
                <p>{errorMessage}</p>
                <p>This block won't render during baking</p>
            </div>
        )
    }

    if (linkedDocument) {
        url = `/${linkedDocument.slug}`
        title = linkedDocument.content.title || title
        authors = linkedDocument.content.authors || authors
        subtitle = linkedDocument.content.excerpt || subtitle
        filename = linkedDocument.content["featured-image"] || filename
    }

    return (
        <a
            href={url}
            className={cx("research-and-writing-link", className)}
            target="_blank"
            rel="noopener noreferrer"
        >
            <div>
                {filename && !shouldHideThumbnail ? (
                    <figure>
                        <Image filename={filename} containerType="thumbnail" />
                    </figure>
                ) : null}
                <h3>{title}</h3>
                {subtitle && !shouldHideSubtitle ? (
                    <p className="research-and-writing-link__description body-1-regular">
                        {subtitle}
                    </p>
                ) : null}
                {authors ? (
                    <p className="research-and-writing-link__authors body-3-medium-italic">
                        {formatAuthors({ authors })}
                    </p>
                ) : null}
            </div>
        </a>
    )
}

export function ResearchAndWriting(props: ResearchAndWritingProps) {
    const { primary, secondary, more, rows, className } = props
    return (
        <div className={cx(className, "grid")}>
            <h2
                className="span-cols-12 display-1-semibold"
                id="research-writing"
            >
                Research & writing
            </h2>
            <ResearchAndWritingLinkContainer
                className="span-cols-6 span-md-cols-6 span-sm-cols-12"
                {...primary}
            />
            <ResearchAndWritingLinkContainer
                className="span-cols-3 span-md-cols-6 span-sm-cols-12"
                {...secondary}
            />
            <div className="span-cols-3 span-md-cols-12">
                <div className="research-and-writing-more">
                    <h5 className="overline-black-caps">Shorts</h5>
                    {more.map((link, i) => (
                        <ResearchAndWritingLinkContainer
                            shouldHideThumbnail
                            shouldHideSubtitle
                            key={i}
                            {...link}
                        />
                    ))}
                </div>
            </div>
            {rows.map((row, i) => (
                <div key={i} className="span-cols-12 research-and-writing-row">
                    <h5 className="overline-black-caps">{row.heading}</h5>
                    <div className="grid grid-cols-4 research-and-writing-row__link-container">
                        {/* center the two thumbnails with a filler element */}
                        {row.articles.length == 2 ? <div /> : null}
                        {row.articles.map((link, i) => (
                            <ResearchAndWritingLinkContainer
                                shouldHideSubtitle
                                className="span-cols-1"
                                key={i}
                                {...link}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}