<?php

require_once 'moocip_controller.php';

class BlocksController extends MoocipController {

    function before_filter(&$action, &$args)
    {
        parent::before_filter($action, $args);
        return sizeof($args) === 1 && strlen($args[0]);
    }

    function get($id)
    {
        $block = \Mooc\AbstractBlock::find($id);
        $ui_block = $this->container['block_factory']->makeBlock($block);

        if (!$ui_block || $this->isJSONRequest()) {
            $this->render_json($block->toArray());
        }

        // wants HTML
        else {
            $html = $this->container['block_renderer']($ui_block, 'student');
            $this->render_text($html);
        }
    }


    function post($id)
    {

    }


    /*****************************/
    /* PROTECTED & PRIVATE STUFF */
    /*****************************/


    /**
     * Extracts action and args from a string.
     *
     * @param  string       the processed string
     *
     * @return array        an array with two elements - a string containing the
     *                      action and an array of strings representing the args
     */
    function extract_action_and_args($string) {
        return array($this->get_verb(), explode('/', $string));
    }


    function map_action($action) {
        return array(&$this, strtolower($action));
    }


    function get_verb() {

        $verb = strtoupper(isset($_REQUEST['_method'])
        ? $_REQUEST['_method'] : @$_SERVER['REQUEST_METHOD']);

        if (!preg_match('/^DELETE|GET|POST|PUT|HEAD|OPTIONS$/', $verb)) {
            throw new Trails_Exception(405);
        }

        return $verb;
    }
}
