const fs = require('fs');
const path = require('path');

const filesToPatch = [
    path.join('C:', 'Users', 'acer', 'Desktop', 'Yadalearn-2.1-main-main', 'Yadalearn-2.1-main-main', 'src', 'features', 'student', 'quick-actions', 'MessageTeacherModal.tsx'),
    path.join('C:', 'Users', 'acer', 'Desktop', 'Yadalearn-2.1-main-main', 'Yadalearn-2.1-main-main', 'src', 'pages', 'StudentDashboard.tsx'),
    path.join('C:', 'Users', 'acer', 'Desktop', 'Yadalearn-2.1-main-main', 'Yadalearn-2.1-main-main', 'src', 'pages', 'TeacherDashboard.tsx'),
];

filesToPatch.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/'document'/g, "'file'");
        // Ensure "Document" stays capitalized where it is used as label
        content = content.replace(/'file'\} \/\//g, "'document'} //");
        content = content.replace(/\{msg.message \|\| 'file'\}/g, "{msg.message || 'Document'}");
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched ${filePath}`);
    }
});
