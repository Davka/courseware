<?
namespace Mooc\UI\SearchBlock;

use Mooc\UI\Block;
use Mooc\DB\Block as DBBlock;

class SearchBlock extends Block
{
    const NAME = 'Suche';

    function initialize()
    {
        $this->defineField('searchtitle', \Mooc\SCOPE_BLOCK, "");
    }

    function student_view()
    {
        // on view: grade with 100%
        $this->setGrade(1.0);
        return array('searchtitle' => $this->searchtitle);
    }

    function author_view()
    {
        $this->authorizeUpdate();
        return array('searchtitle' => $this->searchtitle);
    }

    public function save_handler(array $data)
    {
        $this->authorizeUpdate();

        $this->searchtitle = ($data['searchtitle']);

        return array('searchtitle' => $this->searchtitle);
    }

    /**
     * {@inheritdoc}
     */
    public function exportProperties()
    {
        return array('searchtitle' => $this->searchtitle);
    }

    /**
     * {@inheritdoc}
     */
    public function getXmlNamespace()
    {
        return 'http://moocip.de/schema/block/search/';
    }

    /**
     * {@inheritdoc}
     */
    public function getXmlSchemaLocation()
    {
        return 'http://moocip.de/schema/block/search/search-1.0.xsd';
    }

    /**
     * {@inheritdoc}
     */
    public function importProperties(array $properties)
    {
        if (isset($properties['searchtitle'])) {
            $this->searchtitle = $properties['searchtitle'];
        }
        $this->save();
    }

    public function search_handler(array $data)
    {
        $request = htmlspecialchars($this->Ansi_utf8($data['request']));
        $db = \DBManager::get();
        $stmt = $db->prepare('
            SELECT 
                *
            FROM
                mooc_fields
            WHERE
                json_data LIKE "%'.$request.'%"
            AND
                name IN ("webvideo", "url", "videoTitle", "content", "title", "audio_description", "download_title", "file", "file_name")
        ');
        $stmt->execute();
        $sqlfields = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        $answer = array();
        foreach ($sqlfields as $item) {
            $block = new DBBlock($item["block_id"]);
            if ($item["name"] == "content") {
                $content = str_replace( '<!-- HTML: Insert text after this line only. -->', '', $item["json_data"]);
                if(!stripos($content, $request)) continue;
            }
            array_push($answer, array(
                "link" =>  \PluginEngine::getURL("courseware/courseware")."&selected=".$block->parent_id,
                "type"  => $block->type,
                "title" => (new DBBlock($block->parent_id))->title, // section title
                "subchapter" => (new DBBlock($block->parent->parent->id))->title, //subchapter title
                "chapter" => (new DBBlock($block->parent->parent->parent->id))->title, //chapter title
                "chap" => false
            ));
        }

        $stmt = $db->prepare('
            SELECT 
                *
            FROM
                mooc_blocks
            WHERE
                title LIKE "%'.$request.'%"
            AND
                (type = "Chapter" OR type = "Subchapter" OR type = "Section")
        ');
        $stmt->execute();
        $sqlblocks = $stmt->fetchAll(\PDO::FETCH_ASSOC);
    
        foreach ($sqlblocks as $item) {

            if (strpos($item["title"], "AsideSection") >-1) { 
                continue;
            }

            array_push($answer, array(
                "link" => \PluginEngine::getURL("courseware/courseware")."&selected=".$item["id"],
                "title" => $item["title"],
                "chap" => true
            ));
        }

        return json_encode($answer);

    }
    
    private static function Ansi_utf8($string) {
        $ansi_utf8 = array(
            "�" => "\\\\\\\u00c0",
            "�" => "\\\\\\\u00c1",
            "�" => "\\\\\\\u00c2",
            "�" => "\\\\\\\u00c3",
            "�" => "\\\\\\\u00c4",
            "�" => "\\\\\\\u00c5",
            "�" => "\\\\\\\u00c6",
            "�" => "\\\\\\\u00c7",
            "�" => "\\\\\\\u00c8",
            "�" => "\\\\\\\u00c9",
            "�" => "\\\\\\\u00ca",
            "�" => "\\\\\\\u00cb",
            "�" => "\\\\\\\u00cc",
            "�" => "\\\\\\\u00cd",
            "�" => "\\\\\\\u00ce",
            "�" => "\\\\\\\u00cf",
            "�" => "\\\\\\\u00d1",
            "�" => "\\\\\\\u00d2",
            "�" => "\\\\\\\u00d3",
            "�" => "\\\\\\\u00d4",
            "�" => "\\\\\\\u00d5",
            "�" => "\\\\\\\u00d6",
            "�" => "\\\\\\\u00d8",
            "�" => "\\\\\\\u00d9",
            "�" => "\\\\\\\u00da",
            "�" => "\\\\\\\u00db",
            "�" => "\\\\\\\u00dc",
            "�" => "\\\\\\\u00dd",
            "�" => "\\\\\\\u00df",
            "�" => "\\\\\\\u00e0",
            "�" => "\\\\\\\u00e1",
            "�" => "\\\\\\\u00e2",
            "�" => "\\\\\\\u00e3",
            "�" => "\\\\\\\u00e4",
            "�" => "\\\\\\\u00e5",
            "�" => "\\\\\\\u00e6",
            "�" => "\\\\\\\u00e7",
            "�" => "\\\\\\\u00e8",
            "�" => "\\\\\\\u00e9",
            "�" => "\\\\\\\u00ea",
            "�" => "\\\\\\\u00eb",
            "�" => "\\\\\\\u00ec",
            "�" => "\\\\\\\u00ed",
            "�" => "\\\\\\\u00ee",
            "�" => "\\\\\\\u00ef",
            "�" => "\\\\\\\u00f0",
            "�" => "\\\\\\\u00f1",
            "�" => "\\\\\\\u00f2",
            "�" => "\\\\\\\u00f3",
            "�" => "\\\\\\\u00f4",
            "�" => "\\\\\\\u00f5",
            "�" => "\\\\\\\u00f6",
            "�" => "\\\\\\\u00f8",
            "�" => "\\\\\\\u00f9",
            "�" => "\\\\\\\u00fa",
            "�" => "\\\\\\\u00fb",
            "�" => "\\\\\\\u00fc",
            "�" => "\\\\\\\u00fd",
            "�" => "\\\\\\\u00ff",
        );
        return strtr($string, $ansi_utf8);      

    }
}
