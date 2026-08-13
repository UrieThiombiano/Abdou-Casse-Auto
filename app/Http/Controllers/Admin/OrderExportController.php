<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderExportController extends Controller
{
    public function __invoke(): StreamedResponse
    {
        $filename = 'commandes_abdou_casse_auto.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            // BOM UTF-8 pour qu'Excel detecte l'encodage correctement.
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'ID', 'Date', 'Statut', 'Client', 'Telephone', 'VIN/Chassis',
                'Marque', 'Modele', 'Version/Provenance', 'Annee', 'Piece liee', 'Commentaire',
            ], ';');

            Order::query()
                ->with(['brand', 'listing'])
                ->orderByDesc('created_at')
                ->chunk(200, function ($orders) use ($handle) {
                    foreach ($orders as $order) {
                        fputcsv($handle, [
                            $order->id,
                            $order->created_at->format('d/m/Y H:i'),
                            $order->status->label(),
                            $order->customer_name,
                            $order->customer_phone,
                            $order->vin,
                            $order->brand->name,
                            $order->model,
                            $order->version_provenance,
                            $order->year,
                            $order->listing?->title,
                            $order->comment,
                        ], ';');
                    }
                });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
