;; Keywords
[
  "if"
  "else"
  "elsif"
  "while"
  "for"
  "foreach"
  "forindex"
  "break"
  "continue"
] @keyword

;; Operators
[
  "and" "or"
] @keyword.operator

[
  "!" "*" "-" "+" "~" "/" "==" "=" "!=" "<=" ">=" "<" ">" "?" ":" "*=" "/=" "+=" "-=" "~=" "..."
] @operator

;; Storage
[
  "func"
  "return"
  "var"
] @keyword.storage

;; Nil, boolean and other literals
(nil_literal) @constant.builtin
(boolean_literal) @constant.builtin

;; Special Variables like "me", "arg", etc.
(identifier) @variable.special
  (#match? @variable.special "^(me|arg|parents|obj)$")

;; Numbers
(number_literal) @number

;; Strings
(string_literal) @string
(escaped_character) @string.escape

;; Comments
(comment) @comment

;; Core functions (match them through identifiers)
(identifier) @function
  (#match? @function "^(append|bind|call|caller|chr|closure|cmp|compile|contains|delete|die|find|ghosttype|id|int|keys|left|num|pop|right|setsize|size|sort|split|sprintf|streq|substr|subvec|typeof)$")

;; FlightGear core extensions
(identifier) @function
  (#match? @function "^(abort|abs|aircraftToCart|addcommand|airportinfo|airwaysRoute|assert|carttogeod|cmdarg|courseAndDistance|createDiscontinuity|createViaTo|createWP|createWPFrom|defined|directory|fgcommand|findAirportsByICAO|findAirportsWithinRange|findFixesByID|findNavaidByFrequency|findNavaidsByFrequency|findNavaidsByID|findNavaidsWithinRange|finddata|flightplan|geodinfo|geodtocart|get_cart_ground_intersection|getprop|greatCircleMove|interpolate|isa|logprint|magvar|maketimer|start|stop|restart|maketimestamp|md5|navinfo|parse_markdown|parsexml|print|printf|printlog|rand|registerFlightPlanDelegate|removecommand|removelistener|resolvepath|setlistener|_setlistener|setprop|srand|systime|thisfunc|tileIndex|tilePath|values)$")

;; Timer properties
(identifier) @variable.special
  (#match? @variable.special "^(singleShot|isRunning|simulatedTime)$")

;; Constants
(identifier) @constant
  (#match? @constant "^(D2R|FPS2KT|FT2M|GAL2L|IN2M|KG2LB|KT2FPS|KT2MPS|LG2GAL|LB2KG|M2FT|M2IN|M2NM|MPS2KT|NM2M|R2D)$")

;; Math module
(identifier) @function.method
  (#match? @function.method "^(abs|acos|asin|atan2|avg|ceil|clamp|cos|exp|floor|fmod|in|log10|max|min|mod|periodic|pow|round|sin|sgn|sqrt|tan)$")

(identifier) @constant
  (#match? @constant "^(e|pi)$")

(identifier) @type
  (#match? @type "^(math)$")

;; Props module
(identifier) @function.method
  (#match? @function.method "^(new|addChild|addChildren|alias|clearValue|equals|getAliasTarget|getAttribute|getBoolValue|getChild|getChildren|getIndex|getName|getNode|getParent|getPath|getType|getValue|getValues|initNode|remove|removeAllChildren|removeChild|removeChildren|setAttribute|setBoolValue|setDoubleValue|setIntValue|setValue|setValues|unalias|compileCondition|condition|copy|dump|getNode|nodeList|runBinding|setAll|wrap|wrapNode)$")

(identifier) @type
  (#match? @type "^(Node)$")

(identifier) @variable.special
  (#match? @variable.special "^(props|globals)$")

;; Clipboard module
(identifier) @function.method
  (#match? @function.method "^(getText|setText)$")

(identifier) @type
  (#match? @type "^(clipboard)$")

(identifier) @constant
  (#match? @constant "^(CLIPBOARD|SELECTION)$")

;; Debug module
(identifier) @function.method
  (#match? @function.method "^(attributes|backtrace|bt|benchmark|benchmark_time|dump|isnan|local|print_rank|printerror|propify|proptrace|rank|string|tree|warn|new|enable|disable|getHits|hit)$")

(identifier) @type
  (#match? @type "^(debug|Breakpoint)$")

;; Geo module
(identifier) @function.method
  (#match? @function.method "^(new|set|set_lat|set_lon|set_alt|set_latlon|set_x|set_y|set_z|set_xyz|lat|lon|alt|latlon|x|y|z|xyz|is_defined|dump|course_to|distance_to|direct_distance_to|apply_course_distance|test|update|_equals|aircraft_position|click_position|elevation|format|normdeg|normdeg180|put_model|tile_index|tile_path|viewer_position)$")

(identifier) @type
  (#match? @type "^(geo|PositionedSearch|Coord)$")

(identifier) @constant
  (#match? @constant "^(ERAD)$")

;; IO module
(identifier) @function.method
  (#match? @function.method "^(basename|close|dirname|flush|include|load_nasal|open|read|read_airport_properties|read_properties|readfile|readln|readxml|seek|stat|tell|write|write_properties|writexml)$")

(identifier) @type
  (#match? @type "^(io)$")

(identifier) @constant
  (#match? @constant "^(SEEK_CUR|SEEK_END|SEEK_SET)$")

;; OS Path module
(identifier) @function.method
  (#match? @function.method "^(new|set|append|concat|exists|canRead|canWrite|isFile|isDir|isRelative|isAbsolute|isNull|create_dir|remove|rename|realpath|file|dir|base|file_base|extension|lower_extension|complete_lower_extension|str|mtime)$")

(identifier) @type
  (#match? @type "^(os\\.path)$")

;; GUI module
(identifier) @function.method
  (#match? @function.method "^(popupTip|showDialog|menuEnable|menuBind|setCursor|findElementByName|fpsDisplay|latencyDisplay|popdown|set|setColor|setFont|setBinding|state|del|load|toggle|is_open|reinit|rescan|select|next|previous|set_title|set_button|set_directory|set_file|set_dotfiles|set_pattern|save_flight|load_flight|set_screenshotdir|property_browser|dialog_apply|dialog_update|enable_widgets|nextStyle|setWeight|setWeightOpts|weightChangeHandler|showWeightDialog|showHelpDialog)$")

(identifier) @type
  (#match? @type "^(gui|Widget|Dialog|OverlaySelector|FileSelector|DirSelector)$")
