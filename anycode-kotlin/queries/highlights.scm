[
  "package"
  "import"
  "class"
  "interface"
  "fun"
  "val"
  "var"
  "if"
  "else"
  "for"
  "while"
  "do"
  "when"
  "return"
  "throw"
  "try"
  "catch"
  "finally"
  "object"
  "typealias"
  "companion"
  "constructor"
  "init"
  "this"
  "super"
  "as"
  "is"
  "in"
  "break"
  "continue"
] @keyword

(line_comment) @comment
(multiline_comment) @comment

(string_literal) @string

(integer_literal) @number
(real_literal) @number
(hex_literal) @number
(bin_literal) @number

(class_declaration
  kind: "class"
  (type_identifier) @class)

(class_declaration
  kind: "interface"
  (type_identifier) @interface)

(class_declaration
  kind: "enum"
  (type_identifier) @enum)

(function_declaration
  (simple_identifier) @function)

(property_declaration
  (variable_declaration
    (simple_identifier) @property))

(parameter
  (simple_identifier) @parameter)

(user_type
  (type_identifier) @type)

(call_expression
  (simple_identifier) @function)

(navigation_suffix
  (simple_identifier) @method)
