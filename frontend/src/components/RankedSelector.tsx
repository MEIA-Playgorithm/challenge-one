import { useState } from "react";
import { Box, Chip, Divider, IconButton, List, ListItem, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  label: string;
  all: string[];
  selected: string[];
  excluded?: string[];
  maxItems?: number;
  onChange: (next: string[]) => void;
};

function SortableRow({
  item,
  index,
  onRemove,
}: {
  item: string;
  index: number;
  onRemove: (item: string) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item });

  return (
    <ListItem
      ref={setNodeRef}
      disablePadding
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        py: 0.25,
        bgcolor: index === 0 ? "rgba(46, 230, 166, 0.12)" : "transparent",
        borderRadius: 1,
        px: 0.5,
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      <IconButton
        size="small"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${item}`}
        sx={{ p: 0.25, cursor: "grab", touchAction: "none", "&:active": { cursor: "grabbing" } }}
      >
        <DragIndicatorIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, width: 18, color: index === 0 ? "primary.main" : "text.secondary" }}
      >
        {index + 1}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1 }}>
        {item}
      </Typography>
      <IconButton size="small" onClick={() => onRemove(item)} aria-label={`Remove ${item}`} sx={{ p: 0.25 }}>
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </ListItem>
  );
}

export default function RankedSelector({
  label,
  all,
  selected,
  excluded = [],
  maxItems = 5,
  onChange,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const available = all.filter((item) => !selected.includes(item) && !excluded.includes(item));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const add = (item: string) => {
    if (selected.length >= maxItems) return;
    onChange([...selected, item]);
  };

  const remove = (item: string) => onChange(selected.filter((s) => s !== item));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = selected.indexOf(String(active.id));
    const newIndex = selected.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(selected, oldIndex, newIndex));
  };

  const activeIndex = activeId ? selected.indexOf(activeId) : -1;

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 0.5, display: "block" }}>
            Available
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, minHeight: 36 }}>
            {available.length === 0 && (
              <Typography variant="caption" color="text.disabled" sx={{ alignSelf: "center" }}>
                {selected.length >= maxItems ? `Max ${maxItems} reached` : "None left"}
              </Typography>
            )}
            {available.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                icon={<AddIcon />}
                onClick={() => add(item)}
                disabled={selected.length >= maxItems}
                variant="outlined"
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem />

        <Box sx={{ width: 220 }}>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 0.5, display: "block" }}>
            Selected (ordered)
          </Typography>
          {selected.length === 0 ? (
            <Typography variant="caption" color="text.disabled">
              Click items to add
            </Typography>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveId(null)}
            >
              <SortableContext items={selected} strategy={verticalListSortingStrategy}>
                <List dense disablePadding>
                  {selected.map((item, idx) => (
                    <SortableRow key={item} item={item} index={idx} onRemove={remove} />
                  ))}
                </List>
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      width: 220,
                      borderRadius: 1,
                      bgcolor: "#14352c",
                      border: "1px solid",
                      borderColor: "primary.main",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                  >
                    <DragIndicatorIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, width: 18, color: "primary.main" }}>
                      {activeIndex + 1}
                    </Typography>
                    <Typography variant="body2">{activeId}</Typography>
                  </Box>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </Box>
      </Box>
    </Box>
  );
}
