import { makeValidId } from '../code/Utils';
import React from 'react';
import GroupTree from './GroupTree';
import BinaryResourceItem from './BinaryResourceItem';

export default class BinaryResourceTree extends GroupTree {

    constructor(props) {
        super(props);
        this.title = this.props.type.label;
        this.renderItem = this.renderItem.bind(this);
    }

    renderItem(item) {
        const key = item.value.mimeType.replace("/", "_") + "_" + makeValidId(item.value.name);
        return <BinaryResourceItem  ref={this.addChild} parent={this} title key={key} type={this.props.type} resource={item} root={this.props.root}/>
    }


}