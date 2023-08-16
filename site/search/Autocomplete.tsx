import React, { useLayoutEffect } from "react"
import { render } from "react-dom"
import {
    AutocompleteSource,
    Render,
    autocomplete,
    getAlgoliaResults,
} from "@algolia/autocomplete-js"
import algoliasearch from "algoliasearch"
import { createLocalStorageRecentSearchesPlugin } from "@algolia/autocomplete-plugin-recent-searches"
import { SearchIndexName } from "./searchTypes.js"
import {
    ALGOLIA_ID,
    ALGOLIA_SEARCH_KEY,
} from "../../settings/clientSettings.js"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type BaseItem = Record<string, unknown>

const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
    key: "RECENT_SEARCH",
    limit: 3,
    transformSource({ source }) {
        return {
            ...source,
            templates: {
                ...source.templates,
                header() {
                    return (
                        <h5 className="overline-black-caps">Recent Searches</h5>
                    )
                },
            },
        }
    },
})

const searchClient = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY)

// This is the same function for all three sources
const onSelect: AutocompleteSource<BaseItem>["onSelect"] = ({
    navigator,
    item,
    state,
}) => {
    const itemUrl = item.slug as string
    navigator.navigate({ itemUrl, item, state })
}

// This is the same function for all three sources
const getItemUrl: AutocompleteSource<BaseItem>["getItemUrl"] = ({ item }) =>
    item.slug as string

const FeaturedSearchesSource: AutocompleteSource<BaseItem> = {
    sourceId: "suggestedSearch",
    onSelect,
    getItemUrl,
    getItems() {
        // TODO: this should probably be integrated with GDOCS_HOMEPAGE_CONFIG_DOCUMENT_ID for v2
        return ["COVID-19", "Energy", "GDP", "Poverty", "CO2"].map((term) => ({
            title: term,
            slug: `/search?q=${term}`,
        }))
    },

    templates: {
        header: () => (
            <h5 className="overline-black-caps">Featured Searches</h5>
        ),
        item: ({ item }) => {
            return (
                <div>
                    <span>{item.title}</span>
                </div>
            )
        },
    },
}

const AlgoliaSource: AutocompleteSource<BaseItem> = {
    sourceId: "autocomplete",
    onSelect,
    getItemUrl,
    getItems({ query }) {
        return getAlgoliaResults({
            searchClient,
            queries: [
                {
                    indexName: SearchIndexName.Pages,
                    query,
                    params: {
                        hitsPerPage: 1,
                        distinct: true,
                    },
                },
                {
                    indexName: SearchIndexName.Charts,
                    query,
                    params: {
                        hitsPerPage: 1,
                        distinct: true,
                    },
                },
                {
                    indexName: SearchIndexName.Explorers,
                    query,
                    params: {
                        hitsPerPage: 1,
                        distinct: true,
                    },
                },
            ],
        })
    },

    templates: {
        item: ({ item }) => {
            const index = item.__autocomplete_indexName as SearchIndexName
            const indexLabel = {
                [SearchIndexName.Charts]: "Chart",
                [SearchIndexName.Explorers]: "Explorer",
                [SearchIndexName.Pages]: "Page",
            }[index]

            return (
                <div className="aa-ItemWrapper">
                    <span>{item.title}</span>
                    <span>{indexLabel}</span>
                </div>
            )
        },
    },
}

const AllResultsSource: AutocompleteSource<BaseItem> = {
    sourceId: "runSearch",
    onSelect,
    getItemUrl,
    getItems({ query }) {
        return [
            {
                slug: `/search?q=${encodeURI(query)}`,
                title: `All search results for "${query}"`,
            },
        ]
    },

    templates: {
        item: ({ item }) => {
            return (
                <div className="aa-ItemWrapper">
                    <div className="aa-ItemContent">
                        <div className="aa-ItemIcon">
                            <FontAwesomeIcon icon={faSearch} />
                        </div>
                        <div className="aa-ItemContentBody">{item.title}</div>
                    </div>
                </div>
            )
        },
    },
}

export function Autocomplete({
    onActivate,
    onClose,
}: {
    onActivate: () => void
    onClose: () => void
}) {
    useLayoutEffect(() => {
        if (window.location.pathname === "/search") return
        const search = autocomplete({
            container: "#autocomplete",
            placeholder: "Search for a topic or chart",
            openOnFocus: true,
            onStateChange({ state, prevState }) {
                if (!prevState.isOpen && state.isOpen) {
                    onActivate()
                } else if (prevState.isOpen && !state.isOpen) {
                    onClose()
                }
            },
            onSubmit({ state, navigator }) {
                navigator.navigate({
                    itemUrl: `/search?q=${state.query}`,
                } as any)
            },
            renderer: {
                createElement: React.createElement,
                Fragment: React.Fragment,
                render: render as Render,
            },
            getSources({ query }) {
                const sources: AutocompleteSource<BaseItem>[] = []
                if (query) {
                    sources.push(AlgoliaSource, AllResultsSource)
                } else {
                    sources.push(FeaturedSearchesSource)
                }
                return sources
            },
            plugins: [recentSearchesPlugin],
        })

        return () => search.destroy()
    }, [onActivate, onClose])

    return <div id="autocomplete" />
}
