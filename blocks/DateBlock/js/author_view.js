import $ from 'jquery'
import Backbone from 'backbone'
import AuthorView from 'js/author_view'
import helper from 'js/url'

export default AuthorView.extend({
    events: {
        'click button[name=save]':   'onSave',
        'click button[name=cancel]': 'switchBack'
    },

    initialize() {
        Backbone.on('beforemodeswitch', this.onModeSwitch, this);
        Backbone.on('beforenavigate', this.onNavigate, this);
    },

    render() {
        return this;
    },

    postRender() {
        var $view = this;
        var content = $view.$('.cw-date-stored-content').val();
        if (content == "") {
            return this;
        }
        content = JSON.parse(content);
        $view.$('.cw-date-type option[value="'+content.type+'"]').prop('selected', true);
        $view.$('.cw-date-date').val(content.date);
        $view.$('.cw-date-time').val(content.time);
        $view.$('.cw-date-title').val(content.title);
        $view.$('.cw-date-description').val(content.description);
        $view.$('.cw-date-location').val(content.location);

        return this;
    },

    onNavigate(event) {
        if (!$('section .block-content button[name=save]').length) {
            return;
        }
        if(event.isUserInputHandled) {
            return;
        }
        event.isUserInputHandled = true;
        Backbone.trigger('preventnavigateto', !confirm('Es gibt nicht gespeicherte Änderungen. Möchten Sie die Seite trotzdem verlassen?'));
    },

    onModeSwitch(toView, event) {
        if (toView != 'student') {
            return;
        }
        // the user already switched back (i.e. the is not visible)
        if (!this.$el.is(':visible')) {
            return;
        }
        // another listener already handled the user's feedback
        if (event.isUserInputHandled) {
            return;
        }
        event.isUserInputHandled = true;
        Backbone.trigger('preventviewswitch', !confirm('Es gibt nicht gespeicherte Änderungen. Möchten Sie trotzdem fortfahren?'));
    },

    onSave(event) {
        var $view = this;
        var content = {};
        var date = $view.$('.cw-date-date').val();
        var time = $view.$('.cw-date-time').val();
        var type = $view.$('.cw-date-type option:selected').val();
        if ((time == "")||(date == "")) {
            return;
        }
        event.preventDefault();
        var title = $view.$('.cw-date-title').val();
        var description = $view.$('.cw-date-description').val();
        var location = $view.$('.cw-date-location').val();
        content.type = type;
        content.date = date;
        content.time = time;
        content.title = title;
        content.description = description;
        content.location = location;

        content = JSON.stringify(content);

        helper
        .callHandler(this.model.id, 'save', {
            'date_content' : content,
        })
        .then(
            // success
            function () {
                $(event.target).addClass('accept');
                $view.switchBack();
            },

            // error
            function (error) {
                console.log(error);
            }
        );
    }
});
