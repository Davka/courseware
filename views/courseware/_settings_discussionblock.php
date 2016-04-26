<tr>
    <td>
        <label for="courseware-discussionblock">
            <?= _('Diskussionsblock aktivieren') ?><br>
            <dfn id="courseware-discussionblock-description">
                <?= _('Der Diskussionsblock bietet eine gute M�glichkeit zur Kommunikation zwischen den Teilnehmern. Durch die Aktivierung muss aber der Blubber-Reiter entfernt werden.'); ?>
            </dfn>
        </label>
    </td>
    <td>
        <input id="courseware-discussionblock"
               name="courseware[discussionblock_activation]"
               type="checkbox" <?= $courseware_block->getDiscussionBlockActivation() ? "checked" : "" ?>>
    </td>
</tr>
