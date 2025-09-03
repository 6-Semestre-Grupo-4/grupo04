// components/Sidebar.jsx


const menuItems = [
  { title: "Plano de Contas"},
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 w-60 h-screen pt-20 bg-white border-r dark:bg-gray-800 dark:border-gray-700">
      <ul className="space-y-2 font-medium p-3">
        {menuItems.map((item) => (
          <li key={item.title}>
            <a className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
