'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Plus, Edit2, Trash2, X, Palette,
  ShoppingBag, Coffee, Car, Home, Film, Heart, 
  Zap, Smartphone, Plane, GraduationCap, Gift, MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import { Category, CreateCategoryRequest } from '@/types';

const iconOptions = [
  { name: 'shopping-bag', icon: ShoppingBag },
  { name: 'coffee', icon: Coffee },
  { name: 'car', icon: Car },
  { name: 'home', icon: Home },
  { name: 'film', icon: Film },
  { name: 'heart', icon: Heart },
  { name: 'zap', icon: Zap },
  { name: 'smartphone', icon: Smartphone },
  { name: 'plane', icon: Plane },
  { name: 'graduation-cap', icon: GraduationCap },
  { name: 'gift', icon: Gift },
  { name: 'more-horizontal', icon: MoreHorizontal },
];

const colorOptions = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
];

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find(opt => opt.name === iconName);
  return found ? found.icon : MoreHorizontal;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(colorOptions[0]);
  const [formIcon, setFormIcon] = useState(iconOptions[0].name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setFormName('');
    setFormColor(colorOptions[0]);
    setFormIcon(iconOptions[0].name);
    setShowModal(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormName(category.name);
    setFormColor(category.color);
    setFormIcon(category.icon);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedCategory) {
        const response = await api.updateCategory(selectedCategory.id, {
          name: formName,
          color: formColor,
          icon: formIcon,
        });

        if (response.success) {
          toast.success('Category updated successfully');
          setShowModal(false);
          loadCategories();
        }
      } else {
        const response = await api.createCategory({
          name: formName,
          color: formColor,
          icon: formIcon,
        });

        if (response.success) {
          toast.success('Category created successfully');
          setShowModal(false);
          loadCategories();
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await api.deleteCategory(categoryId);
      if (response.success) {
        toast.success('Category deleted successfully');
        setShowDeleteConfirm(null);
        loadCategories();
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-dark-400">Manage expense categories</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <PieChart className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Categories</h3>
          <p className="text-dark-400 mb-6">Create categories to organize expenses</p>
          <button onClick={handleOpenCreate} className="btn-primary">
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => {
            const IconComponent = getIconComponent(category.icon);
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-5 group hover:border-dark-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent 
                        className="w-6 h-6" 
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{category.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs text-dark-400 uppercase">
                          {category.color}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(category)}
                      className="p-2 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(category.id)}
                      className="p-2 hover:bg-danger-500/20 rounded-lg text-dark-400 hover:text-danger-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {selectedCategory ? 'Edit Category' : 'Create Category'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-dark-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-dark-400" />
                </button>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 mb-6">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: `${formColor}20` }}
                >
                  {(() => {
                    const IconComponent = getIconComponent(formIcon);
                    return <IconComponent className="w-7 h-7" style={{ color: formColor }} />;
                  })()}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {formName || 'Category Name'}
                  </p>
                  <p className="text-sm text-dark-400">Preview</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Food & Dining"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Color
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormColor(color)}
                        className={`w-8 h-8 rounded-lg transition-transform ${
                          formColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setFormIcon(opt.name)}
                        className={`p-3 rounded-xl transition-colors ${
                          formIcon === opt.name
                            ? 'bg-primary-500/20 text-primary-400 ring-1 ring-primary-500'
                            : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-white'
                        }`}
                      >
                        <opt.icon className="w-5 h-5 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formName}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : selectedCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 rounded-full bg-danger-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-danger-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete Category?</h3>
              <p className="text-dark-400 mb-6">
                Expenses using this category will need to be reassigned.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-danger-500 hover:bg-danger-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
