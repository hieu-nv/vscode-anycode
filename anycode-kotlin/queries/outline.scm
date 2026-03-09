(class_declaration
	kind: "class"
	(type_identifier) @class.name
) @class

(class_declaration
	kind: "interface"
	(type_identifier) @interface.name
) @interface

(class_declaration
	kind: "enum"
	(type_identifier) @enum.name
) @enum

(enum_entry
	(simple_identifier) @enumMember.name
) @enumMember

(object_declaration
	(type_identifier) @class.name
) @class

(companion_object
	(type_identifier)? @class.name
) @class

(function_declaration
	(simple_identifier) @method.name
) @method

(property_declaration
    [
        (variable_declaration (simple_identifier) @field.name)
        (multi_variable_declaration (variable_declaration (simple_identifier) @field.name))
    ]
) @field

(type_alias
	(type_identifier) @interface.name
) @interface
