<?php

namespace Mooc\UI\DiscussionBlock;

/**
 */
abstract class Discussion
{

    public function __construct($container)
    {
        $this->container = $container;
        $this->thread    = $this->findOrCreateBlubberThread();
    }

    abstract protected function getDefaultDescription();

    abstract protected function getDefaultName();

    abstract protected function generateID();

    ////////////////////
    // PRIVATE HELPER //
    ////////////////////

    private function generateMD5()
    {
        return md5($this->generateID());
    }


    private function findOrCreateBlubberThread()
    {
        if (!$thread = \BlubberPosting::find($this->generateMD5())) {
            $thread = $this->createBlubberThread();
        }

        return $thread;
    }


    private function createBlubberThread()
    {
        $thread_id = $this->generateMD5();
        $cid       = $this->container['cid'];
        $author_id = $this->container['current_user_id'];

        $thread = new \BlubberPosting($thread_id);

        $data = array(
            'context_type' => 'course',
            'root_id'      => $thread_id,
            'parent_id'    => 0,
            'seminar_id'   => $cid,
            'user_id'      => $author->id,
            'name'         => $this->getDefaultName(),
            'description'  => $this->getDefaultDescription()
        );
        array_walk($data, function ($val, $key) use ($thread) { $thread[$key] = $val; });

        if (!$thread->store()) {
            throw new \RuntimeException("Could not store thread.");
        }

        return $thread;
    }
}
