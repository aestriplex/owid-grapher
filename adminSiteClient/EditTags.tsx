import React from "react"
import { action } from "mobx"
import { observer } from "mobx-react"
import { ChartTagJoin } from "@ourworldindata/utils"
import {
    ReactTags,
    ReactTagsAPI,
    Tag as TagAutocomplete,
} from "react-tag-autocomplete"

@observer
export class EditTags extends React.Component<{
    tags: ChartTagJoin[]
    suggestions: ChartTagJoin[]
    onDelete: (index: number) => void
    onAdd: (tag: ChartTagJoin) => void
    onSave: () => void
}> {
    dismissable: boolean = true
    reactTagsApi = React.createRef<ReactTagsAPI>()

    @action.bound onClickSomewhere() {
        if (this.dismissable) this.props.onSave()
        this.dismissable = true
    }

    @action.bound onClick() {
        this.dismissable = false
    }

    @action.bound onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            this.props.onSave()
        }
    }

    onAdd = (tag: TagAutocomplete) => {
        this.props.onAdd(convertAutocompleteTotag(tag))
    }

    componentDidMount() {
        document.addEventListener("click", this.onClickSomewhere)
        document.addEventListener("keydown", this.onKeyDown)
        this.reactTagsApi.current?.input?.focus()
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.onClickSomewhere)
        document.removeEventListener("keydown", this.onKeyDown)
    }

    render() {
        const { tags, suggestions } = this.props
        return (
            <div className="EditTags" onClick={this.onClick}>
                <ReactTags
                    selected={tags.map(convertTagToAutocomplete)}
                    suggestions={suggestions.map(convertTagToAutocomplete)}
                    activateFirstOption
                    onAdd={this.onAdd}
                    onDelete={this.props.onDelete}
                    ref={this.reactTagsApi}
                />
            </div>
        )
    }
}

const convertTagToAutocomplete = (t: ChartTagJoin) => ({
    value: t.id,
    label: t.name,
})
const convertAutocompleteTotag = (t: TagAutocomplete) => ({
    id: t.value as number,
    name: t.label,
})
