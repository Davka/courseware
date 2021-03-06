<template>
    <li
        class="section-item"
        :class="{
            'section-item-import': importContent,
            'section-item-remote': remoteContent
        }"
        :data-id="id"
    >
        <div
            class="section-description section-handle"
            :class="{
                'full-width': importContent || remoteContent,
                unfolded: unfolded
            }"
            @click="toggleContent"
        >
            <p class="section-title" :title="title">{{ shortTitle }}</p>
            <p class="header-info-wrapper">{{ $t('message.section') }}</p>
        </div>
        <ActionMenuItem
            v-if="!this.importContent && !this.remoteContent"
            :buttons="['groups', 'users', 'edit', 'remove']"
            :element="this.element"
            @edit="editSection"
            @remove="removeElement"
            :class="{ unfolded: unfolded }"
        />
        <draggable
            tag="ul"
            v-if="unfolded"
            :list="blocks"
            :group="draggableGroup"
            v-bind="dragOptions"
            class="block-list"
            :class="{ 'block-list-import': importContent }"
            ghost-class="ghost"
            handle=".block-handle"
            @sort="sortBlocks"
        >
            <BlockItem
                v-for="block in blocks"
                :key="block.id"
                :block="block"
                :importContent="importContent"
                :remoteContent="remoteContent"
                @remove-block="removeBlock"
                @isRemote="isRemoteAction"
            />
            <p v-if="blocks.length == 0">
                {{ $t('message.emptySection') }}.
                <span v-if="!importContent">{{ $t('message.emptySectionInfo') }}.</span>
            </p>
        </draggable>
    </li>
</template>

<script>
import BlockItem from './BlockItem.vue';
import ActionMenuItem from './ActionMenuItem.vue';
import blockManagerHelperMixin from './../mixins/blockManagerHelperMixin.js';
import draggable from 'vuedraggable';
export default {
    name: 'SectionItem',
    mixins: [blockManagerHelperMixin],
    data() {
        return {
            id: this.element.id,
            title: this.element.title,
            shortTitle: this.element.shortTitle,
            unfolded: false,
            blocks: this.element.children,
            blockList: {},
            draggableGroup: { name: 'blocks' }
        };
    },
    components: {
        BlockItem,
        ActionMenuItem,
        draggable
    },
    props: {
        element: Object,
        importContent: Boolean,
        remoteContent: Boolean,
        storeLock: Boolean
    },
    created() {
        if (this.blocks == null) {
            this.blocks = [];
        }
        if (this.importContent) {
            this.draggableGroup = { name: 'blocks', pull: 'clone', put: false };
        }
        this.shortTitle = this.cutTitle(this.element.title, 30);
    },
    watch: {
        element: function() {
            if (this.element.children == null) {
                this.blocks = [];
            } else {
                this.blocks = this.element.children;
            }
        }
    },
    methods: {
        sortBlocks() {
            let view = this;
            let args = {};
            let blockList = [];
            let list = [];
            this.blocks.forEach(element => {
                if (element.isRemote) {
                    list.push('remote_' + element.id);
                    view.$emit('isRemote');
                } else if (element.isImport) {
                    list.push('import_' + element.id);
                    view.$emit('isImport');
                } else {
                    list.push(element.id);
                }
            });
            blockList[this.id] = list;
            args.list = blockList;
            args.type = 'block';
            this.$emit('listUpdate', args);
        },
        removeBlock(data) {
            let blocks = [];
            this.blocks.forEach(element => {
                if (element.id != data.id) {
                    blocks.push(element);
                }
            });
            this.blocks = blocks;
        },
        isRemoteAction() {
            this.$emit('isRemote');
        },
        removeElement() {
            this.$emit('remove-section', this.element);
        },
        editSection(data) {
            this.title = data.title;
            this.shortTitle = this.cutTitle(data.title, 30);
        },
        toggleContent() {
            this.unfolded = !this.unfolded;
        }
    },
    computed: {
        dragOptions() {
            if (this.importContent) {
                return {
                    animation: 200,
                    disabled: this.storeLock,
                    sort: false,
                    ghostClass: 'ghost'
                };
            } else {
                return {
                    animation: 200,
                    disabled: this.storeLock,
                    ghostClass: 'ghost'
                };
            }
        }
    }
};
</script>
