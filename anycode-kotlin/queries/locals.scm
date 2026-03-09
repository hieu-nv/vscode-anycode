(class_body) @scope
(function_body) @scope
(control_structure_body) @scope
(for_statement) @scope
(when_expression) @scope

(variable_declaration
	(simple_identifier) @local
)

(property_declaration
    (variable_declaration
        (simple_identifier) @local
    )
)

(parameter
	(simple_identifier) @local
)

(type_parameter
	(type_identifier) @local
)

(simple_identifier) @usage
(type_identifier) @usage
