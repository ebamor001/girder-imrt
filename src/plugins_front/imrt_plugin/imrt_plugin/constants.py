PROJECTS = {
    'thermolyse': {
        'name': 'Thermolyse',
        'description': 'MRI thermal mapping platform for thermoregulation and thermoablation workflows.',
        'theme': 'thermal-mri',
    },
    'opla': {
        'name': 'OPLA',
        'description': 'Low-field MRI protocol workspace for SVD monitoring.',
        'theme': 'low-field-mri',
    },
    'smart_it': {
        'name': 'Smart IT',
        'description': 'Smart tools platform for medical imaging workflows.',
        'theme': 'ai-tools',
    },
}

TOOLS = [
    {
        'id': 'trame-viewer',
        'name': 'Trame Viewer',
        'description': 'Interactive scientific visualization interface.',
        'url': '/trame',
        'status': 'available',
        'requiresLogin': True,
    },
    {
        'id': 'nifti-converter',
        'name': 'NIfTI Converter',
        'description': 'Prepare medical imaging files for processing workflows.',
        'url': None,
        'status': 'planned',
        'requiresLogin': True,
    },
    {
        'id': 'thermal-mapping',
        'name': 'Thermal Mapping',
        'description': 'Process MRI thermal maps and derived measurements.',
        'url': None,
        'status': 'planned',
        'requiresLogin': True,
    },
]
