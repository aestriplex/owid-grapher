import * as React from "react"
import ReactDOM from "react-dom"
import { observer } from "mobx-react"
import { computed } from "mobx"
import {
    strToQueryParams,
    queryParamsToStr,
    splitURLintoPathAndQueryString,
    QueryParams,
} from "../../clientUtils/url"
import {
    union,
    isEmpty,
    getAttributesOfHTMLElement,
} from "../../clientUtils/Util"
import { EntityUrlBuilder } from "../../grapher/core/EntityUrlBuilder"
import { SelectionArray } from "../../grapher/selection/SelectionArray"

export const PROMINENT_LINK_CLASSNAME = "wp-block-owid-prominent-link"

@observer
class ProminentLink extends React.Component<{
    originalAnchorAttributes: { [key: string]: string }
    innerHTML: string | null
    globalEntitySelection?: SelectionArray
}> {
    @computed get originalURLPath() {
        return splitURLintoPathAndQueryString(
            this.props.originalAnchorAttributes.href
        ).path
    }

    @computed private get originalURLQueryString(): string | undefined {
        return splitURLintoPathAndQueryString(
            this.props.originalAnchorAttributes.href
        ).queryString
    }

    @computed private get originalURLQueryParams(): QueryParams | undefined {
        const { originalURLQueryString } = this

        return originalURLQueryString
            ? strToQueryParams(originalURLQueryString)._original
            : undefined
    }

    @computed private get originalURLSelectedEntities(): string[] {
        const originalEntityQueryParam = this.originalURLQueryParams?.country

        const entityQueryParamExists =
            originalEntityQueryParam != undefined &&
            !isEmpty(originalEntityQueryParam)

        return entityQueryParamExists
            ? EntityUrlBuilder.encodedQueryParamToEntityNames(
                  originalEntityQueryParam
              )
            : []
    }

    @computed private get entitiesInGlobalEntitySelection() {
        return this.props.globalEntitySelection?.selectedEntityNames ?? []
    }

    @computed private get updatedEntityQueryParam(): string {
        const newEntityList = union(
            this.originalURLSelectedEntities,
            this.entitiesInGlobalEntitySelection
        )

        return EntityUrlBuilder.entityNamesToDecodedQueryParam(newEntityList)
    }

    @computed private get updatedURLParams(): QueryParams {
        const { originalURLQueryParams, updatedEntityQueryParam } = this

        return {
            ...originalURLQueryParams,
            ...(!isEmpty(updatedEntityQueryParam) && {
                country: updatedEntityQueryParam,
            }),
        }
    }

    @computed private get updatedURL() {
        return this.originalURLPath + queryParamsToStr(this.updatedURLParams)
    }

    render() {
        return (
            <a
                dangerouslySetInnerHTML={{ __html: this.props.innerHTML ?? "" }}
                {...this.props.originalAnchorAttributes}
                href={this.updatedURL}
            />
        )
    }
}

export const renderProminentLink = (globalEntitySelection?: SelectionArray) =>
    document
        .querySelectorAll<HTMLElement>(`.${PROMINENT_LINK_CLASSNAME}`)
        .forEach((el) => {
            const anchorTag = el.querySelector("a")
            if (!anchorTag) return

            const rendered = (
                <ProminentLink
                    originalAnchorAttributes={getAttributesOfHTMLElement(
                        anchorTag
                    )}
                    innerHTML={anchorTag.innerHTML}
                    globalEntitySelection={globalEntitySelection}
                />
            )

            ReactDOM.render(rendered, el)
        })
